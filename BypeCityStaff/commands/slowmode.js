const { SlashCommandBuilder, PermissionFlagsBits: P } = require('discord.js');
const { COLORS, embed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode').setDescription('Define o modo lento do canal')
    .addIntegerOption((o) => o.setName('segundos').setDescription('0 para desativar (máx. 21600)').setRequired(true).setMinValue(0).setMaxValue(21600))
    .setDefaultMemberPermissions(P.ManageChannels).setDMPermission(false),

  async execute(interaction) {
    const s = interaction.options.getInteger('segundos');
    await interaction.channel.setRateLimitPerUser(s, `Por ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embed(s ? `🐌 Modo lento: **${s}s**.` : '🐇 Modo lento desativado.', COLORS.info)] });
  },
};
