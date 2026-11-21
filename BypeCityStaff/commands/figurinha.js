const { SlashCommandBuilder, PermissionFlagsBits: P, MessageFlags } = require('discord.js');
const sharp = require('sharp');
const { COLORS, embed, logAction } = require('../utils/helpers');

const LIMITE_POR_NIVEL = { 0: 5, 1: 15, 2: 30, 3: 60 };
const MAX_BYTES = 512 * 1024;

async function paraFigurinha(buffer) {
  const base = () => sharp(buffer, { animated: false }).rotate()
    .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
  let out = await base().png({ compressionLevel: 9 }).toBuffer();
  if (out.length > MAX_BYTES) out = await base().png({ compressionLevel: 9, palette: true, quality: 80 }).toBuffer();
  if (out.length > MAX_BYTES) out = await sharp(buffer).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ palette: true, quality: 60 }).toBuffer();
  return out;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('figurinha').setDescription('Transforma uma foto em figurinha do servidor')
    .addAttachmentOption((o) => o.setName('imagem').setDescription('A foto (png, jpg, webp ou gif)').setRequired(true))
    .addStringOption((o) => o.setName('nome').setDescription('Nome da figurinha (2 a 30 letras)').setRequired(true).setMinLength(2).setMaxLength(30))
    .addStringOption((o) => o.setName('emoji').setDescription('Nome do emoji que representa (ex: heart, joy, sparkles) — padrão: sparkles'))
    .setDefaultMemberPermissions(P.ManageGuildExpressions ?? P.ManageEmojisAndStickers)
    .setDMPermission(false),

  async execute(interaction) {
    const img = interaction.options.getAttachment('imagem');
    const nome = interaction.options.getString('nome').trim();
    const tag = (interaction.options.getString('emoji') ?? 'sparkles').trim().replace(/:/g, '') || 'sparkles';

    if (!img.contentType?.startsWith('image/'))
      return interaction.reply({ embeds: [embed('Isso não parece uma imagem. Envie png, jpg, webp ou gif.', COLORS.erro)], flags: MessageFlags.Ephemeral });
    if (img.size > 10 * 1024 * 1024)
      return interaction.reply({ embeds: [embed('Imagem muito grande (máx. 10 MB).', COLORS.erro)], flags: MessageFlags.Ephemeral });

    await interaction.deferReply();

    const existentes = await interaction.guild.stickers.fetch();
    const limite = LIMITE_POR_NIVEL[interaction.guild.premiumTier] ?? 5;
    if (existentes.size >= limite)
      return interaction.editReply({ embeds: [embed(`O servidor já está com **${existentes.size}/${limite}** figurinhas. Remova uma ou aumente o nível de boost.`, COLORS.erro)] });

    try {
      const res = await fetch(img.url);
      const original = Buffer.from(await res.arrayBuffer());
      const png = await paraFigurinha(original);
      if (png.length > MAX_BYTES) throw new Error('não consegui deixar a imagem abaixo de 512 KB');

      const sticker = await interaction.guild.stickers.create({
        file: png, name, tags: tag, description: `Criada por ${interaction.user.tag}`, reason: `/figurinha por ${interaction.user.tag}`,
      });

      await interaction.editReply({
        content: '✨ Figurinha criada! Já dá pra usar no chat.',
        stickers: [sticker.id],
      }).catch(() => interaction.editReply({ embeds: [embed(`✨ Figurinha **${sticker.name}** criada!`, COLORS.ok)] }));
      await logAction(interaction.guild, { titulo: '🖼️ Figurinha criada', campos: [
        { name: 'Nome', value: sticker.name, inline: true },
        { name: 'Staff', value: `${interaction.user}`, inline: true },
      ] });
    } catch (e) {
      await interaction.editReply({ embeds: [embed(`Não consegui criar a figurinha: ${e.message}`, COLORS.erro)] });
    }
  },
};
