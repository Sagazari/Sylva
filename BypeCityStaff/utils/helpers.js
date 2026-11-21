const { EmbedBuilder } = require('discord.js');

const COLORS = { ok: 0x2ecc71, erro: 0xe74c3c, aviso: 0xf1c40f, info: 0x3498db, staff: 0x9b59b6 };

/**
 * Verifica se o autor e o bot podem moderar o membro alvo.
 * Retorna uma string com o erro ou null se estiver tudo certo.
 */
function checkHierarchy(interaction, target) {
  if (!target) return null; // usuário fora do servidor
  const { guild } = interaction;
  if (target.id === interaction.user.id) return 'Você não pode fazer isso com você mesmo.';
  if (target.id === guild.members.me.id) return 'Não posso fazer isso comigo mesmo.';
  if (target.id === guild.ownerId) return 'Não é possível punir o dono do servidor.';
  const me = guild.members.me;
  if (target.roles.highest.position >= me.roles.highest.position)
    return 'Esse membro tem um cargo igual ou acima do meu. Suba o cargo do bot.';
  if (interaction.user.id !== guild.ownerId &&
      target.roles.highest.position >= interaction.member.roles.highest.position)
    return 'Esse membro tem um cargo igual ou acima do seu.';
  return null;
}

/** Envia embed no canal de logs (se configurado). */
async function logAction(guild, { titulo, cor = COLORS.staff, campos = [] }) {
  const id = process.env.LOG_CHANNEL_ID;
  if (!id) return;
  const canal = guild.channels.cache.get(id) ?? (await guild.channels.fetch(id).catch(() => null));
  if (!canal?.isTextBased()) return;
  const e = new EmbedBuilder().setTitle(titulo).setColor(cor).addFields(campos).setTimestamp();
  await canal.send({ embeds: [e] }).catch(() => {});
}

const embed = (descricao, cor = COLORS.ok, titulo) => {
  const e = new EmbedBuilder().setDescription(descricao).setColor(cor);
  if (titulo) e.setTitle(titulo);
  return e;
};

module.exports = { COLORS, checkHierarchy, logAction, embed };
