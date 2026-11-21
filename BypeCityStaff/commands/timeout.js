const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, checkHierarchy, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout').setDescription('Silencia um membro temporariamente')
    .addUserOption((o) => o.setName('usuario').setDescription('Quem silenciar').setRequired(true))
    .addIntegerOption((o) => o.setName('minutos').setDescription('Duração em minutos (máx. 40320 = 28 dias)').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption((o) => o.setName('motivo').setDescription('Motivo'))
    .setDefaultMemberPermissions(P.ModerateMembers).setDMPermission(false),

  async execute(interaction) {
    const membro = interaction.options.getMember('usuario');
    const min = interaction.options.getInteger('minutos');
    const motivo = interaction.options.getString('motivo') ?? 'Sem motivo informado';
    if (!membro) return interaction.reply({ embeds: [embed('Esse usuário não está no servidor.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    const erro = checkHierarchy(interaction, membro);
    if (erro) return interaction.reply({ embeds: [embed(erro, COLORS.erro)], flags: MessageFlags.Ephemeral });
    if (!membro.moderatable) return interaction.reply({ embeds: [embed('Não consigo silenciar esse membro.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    await membro.timeout(min * 60 * 1000, `${interaction.user.tag}: ${motivo}`);
    await interaction.reply({ embeds: [embed(`🔇 **${membro.user.tag}** silenciado por **${min} min**.\n**Motivo:** ${motivo}`, COLORS.aviso)] });
    await logAction(interaction.guild, { titulo: '🔇 Timeout', cor: COLORS.aviso, campos: [
      { name: 'Usuário', value: `${membro.user.tag} (${membro.id})`, inline: true },
      { name: 'Duração', value: `${min} min`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
      { name: 'Motivo', value: motivo },
    ] });
  },
};
