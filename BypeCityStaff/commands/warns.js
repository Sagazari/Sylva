const { SlashCommandBuilder, PermissionFlagsBits: P } = require('discord.js');
const { COLORS, embed } = require('../utils/helpers');
const warns = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns').setDescription('Lista os avisos de um membro')
    .addUserOption((o) => o.setName('usuario').setDescription('Membro').setRequired(true))
    .setDefaultMemberPermissions(P.ModerateMembers).setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const lista = warns.list(interaction.guildId, user.id);
    if (!lista.length) return interaction.reply({ embeds: [embed(`**${user.tag}** não tem avisos.`, COLORS.info)] });
    const txt = lista
      .map((w, i) => `**${i + 1}.** ${w.motivo}\n└ por <@${w.staffId}> em <t:${Math.floor(w.data / 1000)}:d>`)
      .join('\n\n').slice(0, 4000);
    await interaction.reply({ embeds: [embed(txt, COLORS.aviso, `Avisos de ${user.tag} (${lista.length})`)] });
  },
};
