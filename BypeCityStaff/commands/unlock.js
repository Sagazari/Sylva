const { SlashCommandBuilder, PermissionFlagsBits: P } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock').setDescription('Destranca o canal atual')
    .setDefaultMemberPermissions(P.ManageChannels).setDMPermission(false),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }, { reason: `Unlock por ${interaction.user.tag}` });
    await interaction.reply({ embeds: [embed('🔓 Canal destrancado.', COLORS.ok)] });
    await logAction(interaction.guild, { titulo: '🔓 Unlock', cor: COLORS.ok, campos: [
      { name: 'Canal', value: `${interaction.channel}`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
    ] });
  },
};
