const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const { COLORS, embed, checkHierarchy } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick').setDescription('Altera o apelido de um membro (ex: nome do personagem RP)')
    .addUserOption((o) => o.setName('usuario').setDescription('Membro').setRequired(true))
    .addStringOption((o) => o.setName('apelido').setDescription('Novo apelido (vazio = resetar)').setMaxLength(32))
    .setDefaultMemberPermissions(P.ManageNicknames).setDMPermission(false),

  async execute(interaction) {
    const membro = interaction.options.getMember('usuario');
    const apelido = interaction.options.getString('apelido');
    if (!membro) return interaction.reply({ embeds: [embed('Membro não encontrado.', COLORS.erro)], flags: MessageFlags.Ephemeral });
    if (membro.id !== interaction.user.id) {
      const erro = checkHierarchy(interaction, membro);
      if (erro) return interaction.reply({ embeds: [embed(erro, COLORS.erro)], flags: MessageFlags.Ephemeral });
    }
    await membro.setNickname(apelido || null, `Por ${interaction.user.tag}`);
    await interaction.reply({ embeds: [embed(apelido ? `✏️ Apelido de ${membro} alterado para **${apelido}**.` : `✏️ Apelido de ${membro} resetado.`, COLORS.ok)] });
  },
};
