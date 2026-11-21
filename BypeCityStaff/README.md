# 🏙️ Bype City Staff

Bot de staff/administração para o servidor de RP **Bype City** (discord.js v14, slash commands).

## Instalação

1. Instale o [Node.js 18.17+](https://nodejs.org)
2. Crie o bot em https://discord.com/developers/applications
   - Aba **Bot**: copie o **Token** e ative **Server Members Intent** e **Message Content Intent** (a IA precisa ler o chat)
   - Aba **General Information**: copie o **Application ID**
3. Convide o bot com as permissões necessárias (recomendado: **Administrator**) usando o escopo `bot` + `applications.commands`
4. Copie `.env.example` para `.env` e preencha `TOKEN`, `CLIENT_ID`, `GUILD_ID` (e `LOG_CHANNEL_ID` se quiser logs)
5. No terminal, dentro da pasta:

```bash
npm install
npm run deploy   # registra os slash commands
npm start        # liga o bot
```

> **Importante:** no servidor, coloque o cargo do bot **acima** dos cargos que ele precisa gerenciar/punir.

## Criar cargos em massa

```
/criarcargos lista:Dono, Admin, Moderador, Helper, Cidadão
```

Formato avançado por item: `Nome|#cor|preset`

```
/criarcargos lista:Dono|#ff0000|admin; Moderador|#3498db|mod; Helper|#2ecc71|staff; Cidadão|#95a5a6
```

- Separe os cargos por **vírgula** ou **ponto e vírgula**
- **Presets de permissão:** `nenhuma` (padrão), `staff`, `mod`, `admin` (só Administradores podem criar cargos `admin`)
- Opções extras: `cor` (cor padrão), `separado` (exibir separado), `mencionavel`
- Cargos que já existem são ignorados; máximo de 25 por comando
- O 1º da lista fica mais alto na hierarquia

## Comandos

| Comando | O que faz | Permissão |
|---|---|---|
| `/criarcargos` | Cria vários cargos de uma lista | Gerenciar Cargos |
| `/darcargo` `/tirarcargo` | Dá/remove cargo de um membro | Gerenciar Cargos |
| `/ban` `/unban` | Bane / desbane | Banir Membros |
| `/kick` | Expulsa | Expulsar Membros |
| `/timeout` `/untimeout` | Silencia / libera | Moderar Membros |
| `/warn` `/warns` | Avisa / lista avisos | Moderar Membros |
| `/clearwarns` | Limpa avisos | Administrador |
| `/clear` | Apaga mensagens (até 100) | Gerenciar Mensagens |
| `/lock` `/unlock` `/slowmode` | Controle do canal | Gerenciar Canais |
| `/nick` | Altera apelido (nome do personagem) | Gerenciar Apelidos |
| `/anuncio` | Envia embed de anúncio | Gerenciar Servidor |
| `/userinfo` | Info do membro | Moderar Membros |
| `/figurinha` | Transforma uma foto em figurinha do servidor | Gerenciar Expressões |
| `/ativar` `/desativar` | Liga/desliga a IA em um canal | Gerenciar Servidor |
| `/iastatus` | Mostra o que a IA está fazendo agora | Gerenciar Servidor |
| `/ajuda` | Lista de comandos | — |

Todas as ações de staff são registradas no canal definido em `LOG_CHANNEL_ID`.
Os avisos ficam salvos em `data/warns.json`.

## Figurinhas

```
/figurinha imagem:(anexe a foto) nome:meme emoji:joy
```

- Converte a foto para PNG 320x320 (com fundo transparente nas sobras) e abaixo de 512 KB
- GIFs viram figurinha estática (usa o 1º quadro)
- O limite de figurinhas depende do boost do servidor: 5 / 15 / 30 / 60
- O bot precisa da permissão **Gerenciar Expressões**

## IA com personalidade (Gemini)

1. Pegue uma chave grátis em https://aistudio.google.com/apikey e coloque em `GEMINI_API_KEY` no `.env`
2. Rode `/ativar` no canal onde ela deve conversar (`/desativar` para parar)

**Como ela se comporta**

- Fala tudo em minúsculo, sem gramática, cheia de gírias (affyss véi, juroh, tipoh, fortin do céu, delulu, slay...)
- Manda mensagens picadas, uma depois da outra, digitando como gente (às vezes erra uma palavra e corrige com `*palavra`)
- **Rotina** (fuso `IA_TZ`): de manhã trabalha de babá (quase não responde), de tarde fica livre, de noite estuda. Madrugada dorme; fim de semana dorme até tarde
- Quando está livre, sorteia atividades: tiktok, série, skincare, banho, comendo... Cada uma muda a chance de responder. O status do bot no Discord mostra o que ela está fazendo
- Tem **humor** que muda a cada algumas horas (animada, carente, irritada, entediada...)
- Só responde o que tem a ver com ela: quando chamam o nome (`IA_NOME`, padrão **sylva**, ou o apelido `syl`), mencionam o bot, respondem uma mensagem dela ou falam de algo que ela curte. Às vezes ignora, às vezes só reage com emoji, às vezes responde minutos depois explicando que estava ocupada
- **Puxa assunto sozinha** quando o chat fica parado ("que chat morto veyrkkkk"). Se ninguém responde, ela para depois de 2 tentativas
- Se alguém perguntar a sério se ela é bot, ela admite de boa. Também foi instruída a não fazer conteúdo sexual/ofensivo e a acolher quem parecer mal de verdade

**Curiosidade e memória**

- A Sylva faz perguntas de vez em quando (signo, comida favorita, pet, série, crush, personagem do rp) e **guarda as respostas** em `data/ia-memoria.json`, até 15 coisas por pessoa
- Depois ela usa isso na conversa ("ué vc nn é de touro?"), sem recitar tudo de uma vez
- Só guarda coisas leves sobre a própria pessoa. Endereço, telefone, documentos, senha, saúde, religião, política, sexualidade, dinheiro e coisas de menores são bloqueados por um filtro no código, além da regra no prompt
- `/memoria` mostra o que ela guardou sobre você e `/esquecer` apaga tudo. A staff pode usar nos dois para qualquer pessoa. Vale avisar o pessoal do servidor que isso existe

**Reações de estranhamento:** quando acha algo esquisito ela solta ox, oxkkkkk, olkk, n sabia véi, juroh??, nadave, impossivel e variações. Dá para acrescentar mais em `ia/persona.js`.

**Personalizar:** a rotina fica em `ia/rotina.js`, a personalidade e as gírias em `ia/persona.js`, o jeito de digitar em `ia/humanizar.js`.
Se o Gemini der erro 404, troque `GEMINI_MODEL` por um nome de modelo atual.

## Adicionar novos comandos

Crie um arquivo em `commands/` exportando `data` (SlashCommandBuilder) e `execute(interaction)`, depois rode `npm run deploy`.
