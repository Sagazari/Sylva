const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban').setDescription('Remove o ban de um usuário')
    .addStringOption((o) => o.setName('id').setDescription('ID do usuário banido').setRequired(true))
    .addStringOption((o) => o.setName('motivo').setDescription('Motivo'))
    .setDefaultMemberPermissions(P.BanMembers).setDMPermission(false),

  async execute(interaction) {
    const id = interaction.options.getString('id').trim();
    const motivo = interaction.options.getString('motivo') ?? 'Sem motivo informado';
    const ban = await interaction.guild.bans.fetch(id).catch(() => null);
    if (!ban) return interaction.reply({ embeds: [embed('Esse ID não está banido (ou é inválido).', COLORS.erro)], flags: MessageFlags.Ephemeral });

    await interaction.guild.members.unban(id, `${interaction.user.tag}: ${motivo}`);
    await interaction.reply({ embeds: [embed(`✅ **${ban.user.tag}** foi desbanido.`, COLORS.ok)] });
    await logAction(interaction.guild, { titulo: '✅ Unban', cor: COLORS.ok, campos: [
      { name: 'Usuário', value: `${ban.user.tag} (${id})`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
      { name: 'Motivo', value: motivo },
    ] });
  },
};
