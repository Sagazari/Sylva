const { SlashCommandBuilder, PermissionFlagsBits: P } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock').setDescription('Tranca o canal atual (ninguém fala)')
    .addStringOption((o) => o.setName('motivo').setDescription('Motivo'))
    .setDefaultMemberPermissions(P.ManageChannels).setDMPermission(false),

  async execute(interaction) {
    const motivo = interaction.options.getString('motivo') ?? 'Sem motivo informado';
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason: `${interaction.user.tag}: ${motivo}` });
    await interaction.reply({ embeds: [embed(`🔒 Canal trancado.\n**Motivo:** ${motivo}`, COLORS.aviso)] });
    await logAction(interaction.guild, { titulo: '🔒 Lock', cor: COLORS.aviso, campos: [
      { name: 'Canal', value: `${interaction.channel}`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
    ] });
  },
};
