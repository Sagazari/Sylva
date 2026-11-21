const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear').setDescription('Apaga mensagens do canal')
    .addIntegerOption((o) => o.setName('quantidade').setDescription('Quantas mensagens (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption((o) => o.setName('usuario').setDescription('Apagar só as mensagens desse usuário'))
    .setDefaultMemberPermissions(P.ManageMessages).setDMPermission(false),

  async execute(interaction) {
    const qtd = interaction.options.getInteger('quantidade');
    const alvo = interaction.options.getUser('usuario');
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    let msgs = await interaction.channel.messages.fetch({ limit: 100 });
    if (alvo) msgs = msgs.filter((m) => m.author.id === alvo.id);
    const apagadas = await interaction.channel.bulkDelete([...msgs.values()].slice(0, qtd), true);

    await interaction.editReply({ embeds: [embed(`🧹 **${apagadas.size}** mensagens apagadas (só as com menos de 14 dias).`, COLORS.ok)] });
    await logAction(interaction.guild, { titulo: '🧹 Clear', campos: [
      { name: 'Canal', value: `${interaction.channel}`, inline: true },
      { name: 'Qtd', value: String(apagadas.size), inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
    ] });
  },
};
