const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed } = require('../utils/helpers');
const memoria = require('../ia/memoria');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memoria').setDescription('Mostra o que a IA guardou sobre você')
    .addUserOption((o) => o.setName('usuario').setDescription('(só staff) ver de outra pessoa'))
    .setDMPermission(false),

  async execute(interaction) {
    const alvo = interaction.options.getUser('usuario') ?? interaction.user;
    if (alvo.id !== interaction.user.id && !interaction.memberPermissions.has(P.ManageGuild))
      return interaction.reply({ embeds: [embed('Só a staff pode ver a memória de outra pessoa.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    const lista = memoria.fatos(interaction.guildId, alvo.id);
    const txt = lista.length ? lista.map((f) => `• ${f}`).join('\n') : 'Ainda não guardei nada.';
    await interaction.reply({ embeds: [embed(txt, COLORS.info, `🧠 O que eu sei sobre ${alvo.username}`)], flags: MessageFlags.Ephemeral });
  },
};
