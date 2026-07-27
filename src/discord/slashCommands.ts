import {
  SlashCommandBuilder,
  Client,
  ChatInputCommandInteraction,
} from 'discord.js';
import {
  handleResumoInteraction,
  handleExtratoInteraction,
  handleMetaInteraction,
  handleLimiteInteraction,
  handleApagarInteraction,
  handleAjudaInteraction,
} from '../finance/commands';
import { OWNER_DISCORD_ID, ALLOWED_CHANNEL_ID } from '../config/env';

/**
 * Definições dos Slash Commands
 */
export const commands = [
  new SlashCommandBuilder()
    .setName('resumo')
    .setDescription('Mostra o resumo financeiro do mês')
    .addStringOption((option) =>
      option
        .setName('mes')
        .setDescription('Nome do mês (ex: março). Opcional, usa o mês atual se vazio.')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('ano')
        .setDescription('Ano (ex: 2025). Opcional.')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('extrato')
    .setDescription('Mostra as últimas transações')
    .addIntegerOption((option) =>
      option
        .setName('quantidade')
        .setDescription('Quantidade de transações (padrão 10)')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('meta')
    .setDescription('Gerencia objetivos financeiros')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('listar')
        .setDescription('Lista todos os seus objetivos financeiros')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('criar')
        .setDescription('Cria um novo objetivo')
        .addStringOption((option) => option.setName('nome').setDescription('Nome do objetivo').setRequired(true))
        .addNumberOption((option) => option.setName('valor').setDescription('Valor da meta').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('depositar')
        .setDescription('Adiciona progresso a um objetivo')
        .addStringOption((option) => option.setName('nome').setDescription('Nome do objetivo').setRequired(true))
        .addNumberOption((option) => option.setName('valor').setDescription('Valor depositado').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remover')
        .setDescription('Remove um objetivo')
        .addStringOption((option) => option.setName('nome').setDescription('Nome do objetivo').setRequired(true))
    ),

  new SlashCommandBuilder()
    .setName('limite')
    .setDescription('Gerencia limites de gastos por categoria')
    .addStringOption((option) =>
      option
        .setName('categoria')
        .setDescription('Nome da categoria (ex: Alimentação)')
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName('valor')
        .setDescription('Limite mensal em reais')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('apagar')
    .setDescription('Remove a última transação registrada'),

  new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Mostra todos os comandos disponíveis'),
];

/**
 * Registra os slash commands na API do Discord.
 */
export async function registerSlashCommands(client: Client): Promise<void> {
  if (!client.application) return;

  try {
    console.log('🔄 Registrando slash commands...');
    // Registra globalmente (pode levar até 1 hora para propagar em servidores, mas em DMs e guilds test costuma ser rápido)
    await client.application.commands.set(commands);
    console.log('✅ Slash commands registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar slash commands:', error);
  }
}

/**
 * Handler central para interactions de slash commands
 */
export async function handleInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
  // Verifica se é o canal correto
  if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
    await interaction.reply({ content: '⛔ Este bot só pode ser usado no canal configurado.', ephemeral: true });
    return;
  }

  // Verifica se é o dono
  if (interaction.user.id !== OWNER_DISCORD_ID?.trim()) {
    await interaction.reply({ content: '⛔ Você não está autorizado a usar este bot.', ephemeral: true });
    return;
  }

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'resumo':
        await handleResumoInteraction(interaction);
        break;
      case 'extrato':
        await handleExtratoInteraction(interaction);
        break;
      case 'meta':
        await handleMetaInteraction(interaction);
        break;
      case 'limite':
        await handleLimiteInteraction(interaction);
        break;
      case 'apagar':
        await handleApagarInteraction(interaction);
        break;
      case 'ajuda':
        await handleAjudaInteraction(interaction);
        break;
      default:
        await interaction.reply({ content: 'Comando desconhecido.', ephemeral: true });
    }
  } catch (error) {
    console.error(`Erro ao executar o comando /${commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
    }
  }
}
