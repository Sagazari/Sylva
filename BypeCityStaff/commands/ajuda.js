const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder().setName('ajuda').setDescription('Lista os comandos da staff').setDMPermission(false),
  async execute(interaction) {
    const e = new EmbedBuilder().setColor(COLORS.staff).setTitle('🏙️ Bype City Staff • Comandos')
      .setDescription([
        '**Cargos**',
        '`/criarcargos` • cria vários cargos de uma lista',
        '`/darcargo` `/tirarcargo` • gerencia cargos de membros',
        '',
        '**Punições**',
        '`/ban` `/unban` `/kick` `/timeout` `/untimeout`',
        '`/warn` `/warns` `/clearwarns`',
        '',
        '**Canal**',
        '`/clear` `/lock` `/unlock` `/slowmode`',
        '',
        '**Outros**',
        '`/nick` `/anuncio` `/userinfo` `/figurinha`',
        '',
        '**IA**',
        '`/ativar` `/desativar` `/iastatus`',
        '`/memoria` `/esquecer` • o que a IA guardou sobre você',
      ].join('\n'));
    await interaction.reply({ embeds: [e], flags: MessageFlags.Ephemeral });
  },
};
