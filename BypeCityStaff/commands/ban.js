const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, checkHierarchy, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban').setDescription('Bane um membro do servidor')
    .addUserOption((o) => o.setName('usuario').setDescription('Quem banir').setRequired(true))
    .addStringOption((o) => o.setName('motivo').setDescription('Motivo do ban'))
    .addIntegerOption((o) => o.setName('apagar_dias').setDescription('Apagar mensagens dos últimos X dias (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(P.BanMembers).setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') ?? 'Sem motivo informado';
    const dias = interaction.options.getInteger('apagar_dias') ?? 0;
    const membro = interaction.options.getMember('usuario');

    const erro = checkHierarchy(interaction, membro);
    if (erro) return interaction.reply({ embeds: [embed(erro, COLORS.erro)], flags: MessageFlags.Ephemeral });
    if (membro && !membro.bannable)
      return interaction.reply({ embeds: [embed('Não consigo banir esse membro.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    await user.send(`🔨 Você foi **banido** de **${interaction.guild.name}**.\nMotivo: ${motivo}`).catch(() => {});
    await interaction.guild.members.ban(user, { reason: `${interaction.user.tag}: ${motivo}`, deleteMessageSeconds: dias * 86400 });

    await interaction.reply({ embeds: [embed(`🔨 **${user.tag}** foi banido.\n**Motivo:** ${motivo}`, COLORS.erro)] });
    await logAction(interaction.guild, { titulo: '🔨 Ban', cor: COLORS.erro, campos: [
      { name: 'Usuário', value: `${user.tag} (${user.id})`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
      { name: 'Motivo', value: motivo },
    ] });
  },
};
