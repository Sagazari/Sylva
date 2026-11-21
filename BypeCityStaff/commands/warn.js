const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, checkHierarchy, logAction } = require('../utils/helpers');
const warns = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn').setDescription('Dá um aviso a um membro')
    .addUserOption((o) => o.setName('usuario').setDescription('Quem avisar').setRequired(true))
    .addStringOption((o) => o.setName('motivo').setDescription('Motivo do aviso').setRequired(true))
    .setDefaultMemberPermissions(P.ModerateMembers).setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo');
    const erro = checkHierarchy(interaction, interaction.options.getMember('usuario'));
    if (erro) return interaction.reply({ embeds: [embed(erro, COLORS.erro)], flags: MessageFlags.Ephemeral });

    const total = warns.add(interaction.guildId, user.id, motivo, interaction.user.id);
    await user.send(`⚠️ Você recebeu um **aviso** em **${interaction.guild.name}**.\nMotivo: ${motivo}\nTotal de avisos: ${total}`).catch(() => {});
    await interaction.reply({ embeds: [embed(`⚠️ **${user.tag}** recebeu um aviso (**${total}** no total).\n**Motivo:** ${motivo}`, COLORS.aviso)] });
    await logAction(interaction.guild, { titulo: '⚠️ Warn', cor: COLORS.aviso, campos: [
      { name: 'Usuário', value: `${user.tag} (${user.id})`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
      { name: 'Total', value: String(total), inline: true },
      { name: 'Motivo', value: motivo },
    ] });
  },
};
