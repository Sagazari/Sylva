const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anuncio').setDescription('Envia um anúncio em um canal')
    .addStringOption((o) => o.setName('mensagem').setDescription('Texto do anúncio').setRequired(true).setMaxLength(3500))
    .addChannelOption((o) => o.setName('canal').setDescription('Canal (padrão: o atual)'))
    .addStringOption((o) => o.setName('titulo').setDescription('Título do anúncio').setMaxLength(200))
    .setDefaultMemberPermissions(P.ManageGuild).setDMPermission(false),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal') ?? interaction.channel;
    const titulo = interaction.options.getString('titulo') ?? '📢 Anúncio';
    const msg = interaction.options.getString('mensagem').replace(/\\n/g, '\n');
    if (!canal.isTextBased()) return interaction.reply({ content: 'Escolha um canal de texto.', flags: MessageFlags.Ephemeral });

    const e = new EmbedBuilder().setTitle(titulo).setDescription(msg).setColor(COLORS.staff)
      .setFooter({ text: `Bype City • ${interaction.user.tag}` }).setTimestamp();
    await canal.send({ embeds: [e] });
    await interaction.reply({ content: `✅ Anúncio enviado em ${canal}.`, flags: MessageFlags.Ephemeral });
  },
};
