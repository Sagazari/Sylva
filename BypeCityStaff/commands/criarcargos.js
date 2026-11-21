const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');

// Presets de permissão: Nome|#cor|preset
const PRESETS = {
  nenhuma: [],
  staff: [P.ManageMessages, P.ModerateMembers, P.ViewAuditLog, P.MentionEveryone],
  mod: [P.KickMembers, P.BanMembers, P.ModerateMembers, P.ManageMessages, P.ViewAuditLog, P.MuteMembers, P.DeafenMembers, P.MoveMembers],
  admin: [P.Administrator],
};

const HEX = /^#?[0-9a-f]{6}$/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criarcargos')
    .setDescription('Cria vários cargos de uma vez a partir de uma lista')
    .addStringOption((o) =>
      o.setName('lista').setRequired(true)
        .setDescription('Separe por vírgula ou ; — Formato: Nome|#cor|preset (cor e preset opcionais)'))
    .addStringOption((o) =>
      o.setName('cor').setDescription('Cor padrão em HEX para cargos sem cor (ex: #ff0000)'))
    .addBooleanOption((o) =>
      o.setName('separado').setDescription('Mostrar cargos separados na lista de membros? (padrão: não)'))
    .addBooleanOption((o) =>
      o.setName('mencionavel').setDescription('Cargos podem ser mencionados? (padrão: não)'))
    .setDefaultMemberPermissions(P.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const { guild } = interaction;
    if (!guild.members.me.permissions.has(P.ManageRoles))
      return interaction.reply({ embeds: [embed('Eu preciso da permissão **Gerenciar Cargos**.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    const bruto = interaction.options.getString('lista');
    const corPadrao = interaction.options.getString('cor');
    const hoist = interaction.options.getBoolean('separado') ?? false;
    const mentionable = interaction.options.getBoolean('mencionavel') ?? false;

    if (corPadrao && !HEX.test(corPadrao))
      return interaction.reply({ embeds: [embed('Cor padrão inválida. Use HEX, ex: `#ff0000`.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    const itens = bruto.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (!itens.length)
      return interaction.reply({ embeds: [embed('Lista vazia.', COLORS.erro)], flags: MessageFlags.Ephemeral });
    if (itens.length > 25)
      return interaction.reply({ embeds: [embed('Máximo de **25 cargos** por comando.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    await interaction.deferReply();
    await guild.roles.fetch();

    const isAdmin = interaction.member.permissions.has(P.Administrator);
    const criados = [], ignorados = [], falhas = [];
    const nomesVistos = new Set(guild.roles.cache.map((r) => r.name.toLowerCase()));

    for (const item of itens) {
      const [nomeBruto, corBruta, presetBruto] = item.split('|').map((s) => s?.trim());
      const nome = nomeBruto?.slice(0, 100);
      if (!nome) continue;

      if (nomesVistos.has(nome.toLowerCase())) { ignorados.push(`${nome} (já existe)`); continue; }

      const corFinal = corBruta || corPadrao;
      if (corFinal && !HEX.test(corFinal)) { falhas.push(`${nome} (cor inválida)`); continue; }

      const preset = (presetBruto || 'nenhuma').toLowerCase();
      if (!(preset in PRESETS)) { falhas.push(`${nome} (preset "${preset}" inexistente)`); continue; }
      if (preset === 'admin' && !isAdmin) { falhas.push(`${nome} (só Administradores criam cargos admin)`); continue; }

      try {
        await guild.roles.create({
          name: nome,
          color: corFinal ? parseInt(corFinal.replace('#', ''), 16) : undefined,
          hoist,
          mentionable,
          permissions: PRESETS[preset],
          reason: `Criado por ${interaction.user.tag} via /criarcargos`,
        });
        nomesVistos.add(nome.toLowerCase());
        criados.push(nome);
        await sleep(400); // evita rate limit
      } catch (e) {
        falhas.push(`${nome} (${e.message})`);
      }
    }

    const linhas = [];
    if (criados.length) linhas.push(`✅ **Criados (${criados.length}):**\n${criados.map((n) => `• ${n}`).join('\n')}`);
    if (ignorados.length) linhas.push(`⚠️ **Ignorados (${ignorados.length}):**\n${ignorados.map((n) => `• ${n}`).join('\n')}`);
    if (falhas.length) linhas.push(`❌ **Falhas (${falhas.length}):**\n${falhas.map((n) => `• ${n}`).join('\n')}`);
    if (criados.length) linhas.push('ℹ️ O 1º da lista fica mais alto na hierarquia. Ajuste em *Configurações > Cargos* se precisar.');

    await interaction.editReply({
      embeds: [embed(linhas.join('\n\n').slice(0, 4000) || 'Nada a fazer.', criados.length ? COLORS.ok : COLORS.aviso, 'Bype City Staff • Criar Cargos')],
    });

    if (criados.length)
      await logAction(guild, { titulo: '🧩 Cargos criados', campos: [
        { name: 'Staff', value: `${interaction.user}`, inline: true },
        { name: 'Cargos', value: criados.join(', ').slice(0, 1000) },
      ] });
  },
};
