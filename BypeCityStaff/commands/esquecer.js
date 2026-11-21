const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed } = require('../utils/helpers');
const memoria = require('../ia/memoria');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('esquecer').setDescription('Faz a IA esquecer tudo o que guardou sobre você')
    .addUserOption((o) => o.setName('usuario').setDescription('(só staff) esquecer de outra pessoa'))
    .setDMPermission(false),

  async execute(interaction) {
    const alvo = interaction.options.getUser('usuario') ?? interaction.user;
    if (alvo.id !== interaction.user.id && !interaction.memberPermissions.has(P.ManageGuild))
      return interaction.reply({ embeds: [embed('Só a staff pode apagar a memória de outra pessoa.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    const qtd = memoria.esquecer(interaction.guildId, alvo.id);
    await interaction.reply({ embeds: [embed(qtd ? `🧹 Apaguei **${qtd}** coisa(s) sobre ${alvo.username}.` : 'Eu não tinha nada guardado.', COLORS.ok)], flags: MessageFlags.Ephemeral });
  },
};
