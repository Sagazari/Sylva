const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');

function podeGerenciar(interaction, cargo) {
  if (cargo.managed || cargo.id === interaction.guildId) return 'Esse cargo não pode ser atribuído manualmente.';
  if (cargo.position >= interaction.guild.members.me.roles.highest.position) return 'Esse cargo está acima do meu.';
  if (interaction.user.id !== interaction.guild.ownerId && cargo.position >= interaction.member.roles.highest.position)
    return 'Esse cargo está acima (ou igual) ao seu.';
  return null;
}

module.exports = {
  podeGerenciar,
  data: new SlashCommandBuilder()
    .setName('darcargo').setDescription('Dá um cargo a um membro')
    .addUserOption((o) => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addRoleOption((o) => o.setName('cargo').setDescription('Cargo').setRequired(true))
    .setDefaultMemberPermissions(P.ManageRoles).setDMPermission(false),

  async execute(interaction) {
    const membro = interaction.options.getMember('usuario');
    const cargo = interaction.options.getRole('cargo');
    if (!membro) return interaction.reply({ embeds: [embed('Membro não encontrado.', COLORS.erro)], flags: MessageFlags.Ephemeral });
    const erro = podeGerenciar(interaction, cargo);
    if (erro) return interaction.reply({ embeds: [embed(erro, COLORS.erro)], flags: MessageFlags.Ephemeral });

    await membro.roles.add(cargo, `Por ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embed(`✅ ${cargo} adicionado a ${membro}.`, COLORS.ok)] });
    await logAction(interaction.guild, { titulo: '➕ Cargo dado', campos: [
      { name: 'Membro', value: `${membro}`, inline: true },
      { name: 'Cargo', value: `${cargo}`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
    ] });
  },
};
