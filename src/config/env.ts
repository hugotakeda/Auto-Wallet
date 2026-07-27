import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Token do bot Discord.
 * Obtido no Discord Developer Portal → Bot → Token.
 */
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

/**
 * ID do usuário Discord autorizado a interagir com o bot.
 * Para obter: ative "Modo Desenvolvedor" nas configurações do Discord,
 * clique com botão direito no seu perfil → "Copiar ID do Usuário".
 */
export const OWNER_DISCORD_ID = process.env.OWNER_DISCORD_ID;

export const ALLOWED_CHANNEL_ID = process.env.ALLOWED_CHANNEL_ID || '1531407387578208316';

/**
 * Valida que todas as variáveis obrigatórias estão configuradas.
 * Encerra o processo com erro se algo faltar.
 */
export function validateEnv(): void {
  if (!DISCORD_TOKEN || DISCORD_TOKEN.trim() === '') {
    console.error(
      '❌ Variável DISCORD_TOKEN não configurada.\n' +
      '   Copie .env.example para .env e preencha com o token do bot.\n' +
      '   Obtenha em: https://discord.com/developers/applications'
    );
    process.exit(1);
  }

  if (!OWNER_DISCORD_ID || OWNER_DISCORD_ID.trim() === '') {
    console.error(
      '❌ Variável OWNER_DISCORD_ID não configurada.\n' +
      '   Copie .env.example para .env e preencha com seu ID do Discord.\n' +
      '   Exemplo: OWNER_DISCORD_ID=123456789012345678'
    );
    process.exit(1);
  }

  // Validação: Discord IDs são numéricos (snowflakes), 17-20 dígitos
  if (!/^\d{17,20}$/.test(OWNER_DISCORD_ID.trim())) {
    console.error(
      '❌ OWNER_DISCORD_ID deve conter apenas dígitos (17-20 caracteres).\n' +
      `   Valor atual: "${OWNER_DISCORD_ID}"\n` +
      '   Exemplo correto: 123456789012345678'
    );
    process.exit(1);
  }

  console.log('✅ Variáveis de ambiente carregadas com sucesso.');
}
