const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout').setDescription('Remove o silenciamento de um membro')
    .addUserOption((o) => o.setName('usuario').setDescription('Quem liberar').setRequired(true))
    .setDefaultMemberPermissions(P.ModerateMembers).setDMPermission(false),

  async execute(interaction) {
    const membro = interaction.options.getMember('usuario');
    if (!membro) return interaction.reply({ embeds: [embed('Esse usuário não está no servidor.', COLORS.erro)], flags: MessageFlags.Ephemeral });
    if (!membro.isCommunicationDisabled())
      return interaction.reply({ embeds: [embed('Esse membro não está silenciado.', COLORS.aviso)], flags: MessageFlags.Ephemeral });

    await membro.timeout(null, `Removido por ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embed(`🔊 **${membro.user.tag}** foi liberado.`, COLORS.ok)] });
    await logAction(interaction.guild, { titulo: '🔊 Untimeout', cor: COLORS.ok, campos: [
      { name: 'Usuário', value: `${membro.user.tag}`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
    ] });
  },
};
