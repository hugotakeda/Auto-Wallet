import { Message } from 'discord.js';
import { OWNER_DISCORD_ID, ALLOWED_CHANNEL_ID } from '../config/env';
import {
  handleGreeting,
  handleFreeText,
} from '../finance/commands';

function isAuthorized(userId: string): boolean {
  return userId === OWNER_DISCORD_ID?.trim();
}

const GREETINGS = ['oi', 'olá', 'ola', 'hello', 'hi', 'hey', 'bom dia', 'boa tarde', 'boa noite'];

/**
 * Handler para mensagens de texto.
 * Processa apenas saudações e texto livre.
 * Comandos agora são via slash (/).
 */
export async function handleMessage(message: Message): Promise<void> {
  if (message.author.bot) return;

  if (message.channelId !== ALLOWED_CHANNEL_ID) {
    return; // Ignora mensagens de outros canais
  }

  if (!isAuthorized(message.author.id)) {
    console.log('⛔ Mensagem de usuário não autorizado ignorada.');
    return;
  }

  const text = message.content;
  if (!text || text.trim() === '') return;

  const trimmed = text.trim();
  const normalized = trimmed.toLowerCase();

  console.log(`📩 Mensagem recebida: "${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}"`);

  // Ignora mensagens que começam com ! ou / para evitar conflitos (slash commands já são tratados no interactionCreate)
  if (trimmed.startsWith('!') || trimmed.startsWith('/')) {
    if (trimmed.startsWith('!')) {
      await message.reply('O bot foi atualizado! Por favor, utilize os comandos slash (digite `/`).');
    }
    return;
  }

  // Saudações
  if (GREETINGS.includes(normalized)) {
    await handleGreeting(message);
    return;
  }

  // Linguagem natural
  const handled = await handleFreeText(message);
  if (handled) return;

  // Fallback
  await message.reply(
    '🤔 Não entendi essa mensagem.\n\n' +
    'Tente algo como:\n' +
    '> `gastei 50 no mercado`\n' +
    '> `recebi 3000 de salário`\n\n' +
    'Ou digite `/ajuda` para ver todos os comandos.'
  );
}
