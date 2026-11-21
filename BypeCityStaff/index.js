require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Client, GatewayIntentBits, Collection, Events, MessageFlags, ActivityType } = require('discord.js');
const cerebro = require('./ia/cerebro');

// Pequeno servidor HTTP para o Render e para o monitoramento do UptimeRobot.
// O bot continua conectado ao Discord pelo Gateway normalmente.
const PORT = Number(process.env.PORT) || 3000;
const healthServer = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  if (req.url === '/' || req.url === '/health') {
    const body = JSON.stringify({
      status: 'ok',
      service: 'BypeCityStaff',
      discord: client?.isReady() ? 'connected' : 'connecting',
    });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(req.method === 'HEAD' ? undefined : body);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(req.method === 'HEAD' ? undefined : 'Not found');
});

healthServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Servidor HTTP ativo na porta ${PORT} (UptimeRobot: /health)`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // necessário pra IA ler o chat (ative no Developer Portal)
  ],
});

client.commands = new Collection();
const dir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const cmd = require(path.join(dir, file));
  if (cmd.data) client.commands.set(cmd.data.name, cmd);
}

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bype City Staff online como ${c.user.tag}`);
  c.user.setActivity('Bype City | /ajuda', { type: ActivityType.Watching });
  cerebro.iniciar(c);
});

client.on(Events.MessageCreate, (message) => {
  try { cerebro.onMessage(message, client); } catch (e) { console.error('[ia]', e); }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(`Erro em /${interaction.commandName}:`, err);
    const msg = { content: '❌ Ocorreu um erro ao executar esse comando.', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) await interaction.followUp(msg).catch(() => {});
    else await interaction.reply(msg).catch(() => {});
  }
});

client.login(process.env.TOKEN);
