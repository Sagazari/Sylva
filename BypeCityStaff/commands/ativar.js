const { SlashCommandBuilder, PermissionFlagsBits: P, ChannelType, MessageFlags } = require('discord.js');
const { COLORS, embed } = require('../utils/helpers');
const store = require('../ia/store');
const cerebro = require('../ia/cerebro');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ativar').setDescription('Ativa a IA conversando no chat')
    .addChannelOption((o) => o.setName('canal').setDescription('Canal (padrão: o atual)').addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(P.ManageGuild).setDMPermission(false),

  async execute(interaction) {
    if (!process.env.GEMINI_API_KEY)
      return interaction.reply({ embeds: [embed('Falta a `GEMINI_API_KEY` no `.env` do bot.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    const canal = interaction.options.getChannel('canal') ?? interaction.channel;
    store.ativar(canal.id, interaction.guildId);
    await interaction.reply({ embeds: [embed(`✅ IA ativada em ${canal}.`, COLORS.ok)], flags: MessageFlags.Ephemeral });
    cerebro.cumprimentar(canal).catch(() => {});
  },
};
