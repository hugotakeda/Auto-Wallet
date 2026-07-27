/**
 * ╔══════════════════════════════════════╗
 * ║   Comandos Financeiros               ║
 * ║   Lógica de negócio dos comandos     ║
 * ╚══════════════════════════════════════╝
 */

import { Message, ChatInputCommandInteraction } from 'discord.js';
import {
  addTransaction,
  removeLastTransaction,
  getLastTransactions,
  getTransactionsByMonth,
  addGoal,
  depositToGoal,
  getGoals,
  removeGoal,
  setSpendingLimit,
  getSpendingLimit,
  getAllLimits,
} from '../data/store';
import { findCategoryByName } from '../data/categories';
import { parseTransaction } from './parser';
import {
  transactionEmbed,
  summaryEmbed,
  statementEmbed,
  goalsEmbed,
  goalCreatedEmbed,
  goalDepositEmbed,
  limitSetEmbed,
  transactionRemovedEmbed,
  helpEmbed,
  welcomeEmbed,
} from '../discord/embeds';

// ─── Mapa de nomes de meses ──────────────────────────────────────

const MONTH_NAMES: Record<string, number> = {
  'janeiro': 0, 'jan': 0,
  'fevereiro': 1, 'fev': 1,
  'março': 2, 'marco': 2, 'mar': 2,
  'abril': 3, 'abr': 3,
  'maio': 4, 'mai': 4,
  'junho': 5, 'jun': 5,
  'julho': 6, 'jul': 6,
  'agosto': 7, 'ago': 7,
  'setembro': 8, 'set': 8,
  'outubro': 9, 'out': 9,
  'novembro': 10, 'nov': 10,
  'dezembro': 11, 'dez': 11,
};

// ─── Comandos Slash ──────────────────────────────────────────────

export async function handleResumoInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
  let month: number;
  let year: number;

  const mesOption = interaction.options.getString('mes');
  const anoOption = interaction.options.getInteger('ano');

  if (!mesOption) {
    const now = new Date();
    month = now.getMonth();
    year = now.getFullYear();
  } else {
    const parsedMonth = MONTH_NAMES[mesOption.toLowerCase()];
    if (parsedMonth === undefined) {
      await interaction.reply({ content: '❌ Mês não reconhecido.', ephemeral: true });
      return;
    }
    month = parsedMonth;
    year = anoOption ?? new Date().getFullYear();
  }

  const transactions = getTransactionsByMonth(month, year);
  const limits = getAllLimits();
  const embed = summaryEmbed(month, year, transactions, limits);
  await interaction.reply({ embeds: [embed] });
}

export async function handleExtratoInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
  const count = interaction.options.getInteger('quantidade') ?? 10;
  const validCount = Math.max(1, Math.min(count, 50));

  const transactions = getLastTransactions(validCount);
  const embed = statementEmbed(transactions, validCount);
  await interaction.reply({ embeds: [embed] });
}

export async function handleMetaInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'listar') {
    const goals = getGoals();
    const embed = goalsEmbed(goals);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (subcommand === 'criar') {
    const name = interaction.options.getString('nome', true);
    const value = interaction.options.getNumber('valor', true);

    if (value <= 0) {
      await interaction.reply({ content: '❌ O valor deve ser maior que zero.', ephemeral: true });
      return;
    }

    const goal = addGoal(name, value);
    const embed = goalCreatedEmbed(goal);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (subcommand === 'depositar') {
    const name = interaction.options.getString('nome', true);
    const value = interaction.options.getNumber('valor', true);

    if (value <= 0) {
      await interaction.reply({ content: '❌ O valor deve ser maior que zero.', ephemeral: true });
      return;
    }

    const goal = depositToGoal(name, value);
    if (!goal) {
      await interaction.reply({ content: `❌ Objetivo "${name}" não encontrado.`, ephemeral: true });
      return;
    }

    const embed = goalDepositEmbed(goal, value);
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (subcommand === 'remover') {
    const name = interaction.options.getString('nome', true);
    const removed = removeGoal(name);
    
    if (!removed) {
      await interaction.reply({ content: `❌ Objetivo "${name}" não encontrado.`, ephemeral: true });
      return;
    }

    await interaction.reply(`✅ Objetivo **"${removed.name}"** removido com sucesso.`);
    return;
  }
}

export async function handleLimiteInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
  const categoryName = interaction.options.getString('categoria', true);
  const limitValue = interaction.options.getNumber('valor', true);

  if (limitValue <= 0) {
    await interaction.reply({ content: '❌ O limite deve ser maior que zero.', ephemeral: true });
    return;
  }

  const category = findCategoryByName(categoryName);
  if (!category) {
    await interaction.reply({ 
      content: `❌ Categoria "${categoryName}" não encontrada.\nCategorias: Alimentação, Transporte, Moradia, Saúde, Lazer, Vestuário, Educação, Trabalho, Assinaturas, Outros`, 
      ephemeral: true 
    });
    return;
  }

  setSpendingLimit(category.name, limitValue);
  const embed = limitSetEmbed(`${category.emoji} ${category.name}`, limitValue);
  await interaction.reply({ embeds: [embed] });
}

export async function handleApagarInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
  const removed = removeLastTransaction();

  if (!removed) {
    await interaction.reply({ content: '❌ Nenhuma transação para apagar.', ephemeral: true });
    return;
  }

  const embed = transactionRemovedEmbed(removed);
  await interaction.reply({ embeds: [embed] });
}

export async function handleAjudaInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = helpEmbed();
  await interaction.reply({ embeds: [embed] });
}

// ─── Processamento de Texto Livre e Saudações ─────────────────────

export async function handleGreeting(message: Message): Promise<void> {
  const embed = welcomeEmbed();
  await message.reply({ embeds: [embed] });
}

export async function handleFreeText(message: Message): Promise<boolean> {
  const parsed = parseTransaction(message.content);

  if (!parsed) return false;

  const transaction = addTransaction(
    parsed.type,
    parsed.amount,
    parsed.category.name,
    parsed.category.emoji,
    parsed.description
  );

  let alertMessage: string | undefined;
  if (parsed.type === 'gasto') {
    const limit = getSpendingLimit(parsed.category.name);
    if (limit !== null) {
      const now = new Date();
      const monthTransactions = getTransactionsByMonth(now.getMonth(), now.getFullYear());
      const categoryTotal = monthTransactions
        .filter((t) => t.type === 'gasto' && t.category === parsed.category.name)
        .reduce((sum, t) => sum + t.amount, 0);

      if (categoryTotal > limit) {
        alertMessage = `Você ultrapassou o limite de R$ ${limit.toFixed(2).replace('.', ',')} para **${parsed.category.name}** este mês!\nTotal gasto: R$ ${categoryTotal.toFixed(2).replace('.', ',')}`;
      }
    }
  }

  const embed = transactionEmbed(
    parsed.type,
    parsed.amount,
    parsed.category.emoji,
    parsed.category.name,
    parsed.description,
    alertMessage
  );

  await message.reply({ embeds: [embed] });
  return true;
}
