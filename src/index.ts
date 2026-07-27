/**
 * ╔══════════════════════════════════════╗
 * ║        💳 My Wallet Bot              ║
 * ║   Assistente financeiro pessoal      ║
 * ║          via Discord                 ║
 * ╚══════════════════════════════════════╝
 * 
 * Ponto de entrada do aplicativo.
 * Valida o ambiente, conecta ao Discord e registra o handler de mensagens.
 */

import { validateEnv } from './config/env';
import { createDiscordClient } from './discord/client';

async function main(): Promise<void> {
  console.log('');
  console.log('💳 My Wallet — Iniciando...');
  console.log('─'.repeat(40));

  // 1. Valida variáveis de ambiente
  validateEnv();

  // 2. Conecta ao Discord
  console.log('🤖 Conectando ao Discord...');
  await createDiscordClient();
}

// Inicia o bot e captura erros fatais
main().catch((error) => {
  console.error('❌ Erro fatal ao iniciar o bot:', error.message);
  process.exit(1);
});

// Captura sinais de encerramento para sair limpo
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando My Wallet... Até logo!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Encerrando My Wallet... Até logo!');
  process.exit(0);
});
