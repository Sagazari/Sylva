const { SlashCommandBuilder, PermissionFlagsBits: P, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../utils/helpers');
const warns = require('../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo').setDescription('Mostra informações de um membro')
    .addUserOption((o) => o.setName('usuario').setDescription('Membro (padrão: você)'))
    .setDefaultMemberPermissions(P.ModerateMembers).setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const m = interaction.options.getMember('usuario') ?? interaction.member;
    const e = new EmbedBuilder().setColor(COLORS.info).setTitle(user.tag).setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Conta criada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Entrou no servidor', value: m?.joinedTimestamp ? `<t:${Math.floor(m.joinedTimestamp / 1000)}:R>` : '—', inline: true },
        { name: 'Avisos', value: String(warns.list(interaction.guildId, user.id).length), inline: true },
        { name: 'Cargos', value: m ? m.roles.cache.filter((r) => r.id !== interaction.guildId).map((r) => `${r}`).join(' ') || '—' : '—' },
      );
    await interaction.reply({ embeds: [e] });
  },
};
