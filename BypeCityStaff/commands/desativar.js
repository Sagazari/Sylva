const { SlashCommandBuilder, PermissionFlagsBits: P, ChannelType, MessageFlags } = require('discord.js');
const { COLORS, embed } = require('../utils/helpers');
const store = require('../ia/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('desativar').setDescription('Desativa a IA em um canal')
    .addChannelOption((o) => o.setName('canal').setDescription('Canal (padrão: o atual)').addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(P.ManageGuild).setDMPermission(false),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal') ?? interaction.channel;
    const tinha = store.desativar(canal.id);
    await interaction.reply({
      embeds: [embed(tinha ? `🔕 IA desativada em ${canal}.` : `A IA não estava ativa em ${canal}.`, tinha ? COLORS.ok : COLORS.aviso)],
      flags: MessageFlags.Ephemeral,
    });
  },
};
