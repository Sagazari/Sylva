const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed } = require('../utils/helpers');
const rotina = require('../ia/rotina');
const store = require('../ia/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('iastatus').setDescription('Mostra o que a IA está fazendo agora')
    .setDefaultMemberPermissions(P.ManageGuild).setDMPermission(false),

  async execute(interaction) {
    const st = rotina.estado();
    const h = rotina.humor();
    const canais = store.listar().map((id) => `<#${id}>`).join(', ') || 'nenhum';
    await interaction.reply({
      embeds: [embed(
        `**Fazendo:** ${st.descricao}\n**Humor:** ${h.nome}\n**Disponibilidade:** ${Math.round(st.disp * 100)}%\n**Canais ativos:** ${canais}`,
        COLORS.info, '🧠 Status da IA')],
      flags: MessageFlags.Ephemeral,
    });
  },
};
