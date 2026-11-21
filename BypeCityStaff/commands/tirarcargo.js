const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, logAction } = require('../utils/helpers');
const { podeGerenciar } = require('./darcargo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tirarcargo').setDescription('Remove um cargo de um membro')
    .addUserOption((o) => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addRoleOption((o) => o.setName('cargo').setDescription('Cargo').setRequired(true))
    .setDefaultMemberPermissions(P.ManageRoles).setDMPermission(false),

  async execute(interaction) {
    const membro = interaction.options.getMember('usuario');
    const cargo = interaction.options.getRole('cargo');
    if (!membro) return interaction.reply({ embeds: [embed('Membro não encontrado.', COLORS.erro)], flags: MessageFlags.Ephemeral });
    const erro = podeGerenciar(interaction, cargo);
    if (erro) return interaction.reply({ embeds: [embed(erro, COLORS.erro)], flags: MessageFlags.Ephemeral });

    await membro.roles.remove(cargo, `Por ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embed(`✅ ${cargo} removido de ${membro}.`, COLORS.ok)] });
    await logAction(interaction.guild, { titulo: '➖ Cargo removido', campos: [
      { name: 'Membro', value: `${membro}`, inline: true },
      { name: 'Cargo', value: `${cargo}`, inline: true },
      { name: 'Staff', value: `${interaction.user}`, inline: true },
    ] });
  },
};
