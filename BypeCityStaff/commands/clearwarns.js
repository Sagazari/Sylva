const { SlashCommandBuilder, PermissionFlagsBits: P } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');
const warns = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns').setDescription('Remove todos os avisos de um membro')
    .addUserOption((o) => o.setName('usuario').setDescription('Membro').setRequired(true))
    .setDefaultMemberPermissions(P.Administrator).setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    warns.clear(interaction.guildId, user.id);
    await interaction.reply({ embeds: [embed(`🧹 Avisos de **${user.tag}** removidos.`, COLORS.ok)] });
    await logAction(interaction.guild, { titulo: '🧹 Clearwarns', campos: [
      { name: 'Usuário', value: `${user.tag}`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
    ] });
  },
};
