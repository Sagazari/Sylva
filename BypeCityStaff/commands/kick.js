const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, checkHierarchy, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick').setDescription('Expulsa um membro do servidor')
    .addUserOption((o) => o.setName('usuario').setDescription('Quem expulsar').setRequired(true))
    .addStringOption((o) => o.setName('motivo').setDescription('Motivo'))
    .setDefaultMemberPermissions(P.KickMembers).setDMPermission(false),

  async execute(interaction) {
    const membro = interaction.options.getMember('usuario');
    const motivo = interaction.options.getString('motivo') ?? 'Sem motivo informado';
    if (!membro) return interaction.reply({ embeds: [embed('Esse usuário não está no servidor.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    const erro = checkHierarchy(interaction, membro);
    if (erro) return interaction.reply({ embeds: [embed(erro, COLORS.erro)], flags: MessageFlags.Ephemeral });
    if (!membro.kickable) return interaction.reply({ embeds: [embed('Não consigo expulsar esse membro.', COLORS.erro)], flags: MessageFlags.Ephemeral });

    await membro.send(`👢 Você foi **expulso** de **${interaction.guild.name}**.\nMotivo: ${motivo}`).catch(() => {});
    await membro.kick(`${interaction.user.tag}: ${motivo}`);

    await interaction.reply({ embeds: [embed(`👢 **${membro.user.tag}** foi expulso.\n**Motivo:** ${motivo}`, COLORS.aviso)] });
    await logAction(interaction.guild, { titulo: '👢 Kick', cor: COLORS.aviso, campos: [
      { name: 'Usuário', value: `${membro.user.tag} (${membro.id})`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
      { name: 'Motivo', value: motivo },
    ] });
  },
};
