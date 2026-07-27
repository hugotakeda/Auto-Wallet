import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';
import { DISCORD_TOKEN } from '../config/env';
import { handleMessage } from './handler';
import { registerSlashCommands, handleInteraction } from './slashCommands';

/**
 * Cria e gerencia a conexão com o Discord.
 */
export async function createDiscordClient(): Promise<Client> {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [
      Partials.Channel, // Necessário para DMs
    ],
  });

  // ─── Evento: bot pronto ─────────────────────────────────────────
  client.once(Events.ClientReady, async (readyClient) => {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log(`║   ✅ My Wallet online no Discord      ║`);
    console.log(`║   Logado como: ${readyClient.user.tag.padEnd(20)}  ║`);
    console.log('╚══════════════════════════════════════╝');
    console.log('');
    
    // Registra os slash commands na API do Discord
    await registerSlashCommands(readyClient);
    
    console.log('Aguardando mensagens e comandos...');
  });

  // ─── Evento: interações (slash commands) ────────────────────────
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    await handleInteraction(interaction);
  });

  // ─── Evento: mensagens recebidas ────────────────────────────────
  client.on(Events.MessageCreate, handleMessage);

  // ─── Conecta ao Discord ─────────────────────────────────────────
  await client.login(DISCORD_TOKEN);

  return client;
}
