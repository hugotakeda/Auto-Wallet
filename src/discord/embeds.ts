/**
 * ╔══════════════════════════════════════╗
 * ║   Discord Embeds — Respostas Ricas   ║
 * ║   Formatação bonita para o Discord   ║
 * ╚══════════════════════════════════════╝
 */

import { EmbedBuilder } from 'discord.js';
import { Transaction, Goal, SpendingLimit } from '../data/store';
import { CATEGORIES } from '../data/categories';

// ─── Cores ───────────────────────────────────────────────────────

const COLORS = {
  success: 0x2ecc71,  // Verde
  expense: 0xe74c3c,  // Vermelho
  income: 0x3498db,   // Azul
  info: 0x9b59b6,     // Roxo
  warning: 0xf39c12,  // Laranja
  neutral: 0x95a5a6,  // Cinza
  gold: 0xf1c40f,     // Dourado
} as const;

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Formata valor em reais.
 */
function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata data ISO para dd/mm/yyyy.
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/**
 * Cria uma barra de progresso visual com Unicode.
 */
function progressBar(current: number, target: number, length: number = 10): string {
  const ratio = Math.min(current / target, 1);
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty) + ` ${(ratio * 100).toFixed(0)}%`;
}

/**
 * Retorna o nome do mês em português.
 */
function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return months[month];
}

// ─── Embeds ──────────────────────────────────────────────────────

/**
 * Embed de confirmação de transação registrada.
 */
export function transactionEmbed(
  type: 'gasto' | 'receita',
  amount: number,
  categoryEmoji: string,
  categoryName: string,
  description: string,
  alertMessage?: string
): EmbedBuilder {
  const isExpense = type === 'gasto';
  const embed = new EmbedBuilder()
    .setColor(isExpense ? COLORS.expense : COLORS.income)
    .setTitle(`${isExpense ? '📉' : '📈'} ${isExpense ? 'Gasto' : 'Receita'} registrado!`)
    .addFields(
      { name: '💰 Valor', value: formatCurrency(amount), inline: true },
      { name: `${categoryEmoji} Categoria`, value: categoryName, inline: true },
      { name: '📝 Descrição', value: description, inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });

  if (alertMessage) {
    embed.addFields({ name: '⚠️ Alerta', value: alertMessage, inline: false });
  }

  return embed;
}

/**
 * Embed de resumo mensal completo.
 */
export function summaryEmbed(
  month: number,
  year: number,
  transactions: Transaction[],
  limits: SpendingLimit[]
): EmbedBuilder {
  const expenses = transactions.filter((t) => t.type === 'gasto');
  const incomes = transactions.filter((t) => t.type === 'receita');

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncomes = incomes.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncomes - totalExpenses;

  // Agrupa gastos por categoria
  const byCategory = new Map<string, { emoji: string; total: number }>();
  for (const t of expenses) {
    const existing = byCategory.get(t.category) || { emoji: t.categoryEmoji, total: 0 };
    existing.total += t.amount;
    byCategory.set(t.category, existing);
  }

  // Ordena categorias por valor (maior primeiro)
  const sortedCategories = [...byCategory.entries()].sort((a, b) => b[1].total - a[1].total);

  // Monta string de categorias
  let categoryBreakdown = '';
  for (const [name, { emoji, total }] of sortedCategories) {
    const percentage = totalExpenses > 0 ? ((total / totalExpenses) * 100).toFixed(0) : '0';
    const limit = limits.find((l) => l.category.toLowerCase() === name.toLowerCase());
    const limitWarning = limit && total > limit.limit ? ' ⚠️' : '';
    categoryBreakdown += `${emoji} **${name}**: ${formatCurrency(total)} (${percentage}%)${limitWarning}\n`;
  }

  if (!categoryBreakdown) {
    categoryBreakdown = '*Nenhum gasto registrado*';
  }

  const embed = new EmbedBuilder()
    .setColor(balance >= 0 ? COLORS.success : COLORS.expense)
    .setTitle(`📊 Resumo de ${getMonthName(month)} ${year}`)
    .addFields(
      { name: '📈 Total Recebido', value: formatCurrency(totalIncomes), inline: true },
      { name: '📉 Total Gasto', value: formatCurrency(totalExpenses), inline: true },
      { name: `${balance >= 0 ? '✅' : '🔴'} Saldo`, value: formatCurrency(balance), inline: true },
      { name: `📋 Gastos por Categoria (${expenses.length} transações)`, value: categoryBreakdown, inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });

  return embed;
}

/**
 * Embed de extrato (últimas transações).
 */
export function statementEmbed(transactions: Transaction[], count: number): EmbedBuilder {
  let description = '';

  if (transactions.length === 0) {
    description = '*Nenhuma transação registrada ainda.*';
  } else {
    for (const t of transactions) {
      const sign = t.type === 'gasto' ? '-' : '+';
      const emoji = t.type === 'gasto' ? '🔴' : '🟢';
      description += `${emoji} ${formatDate(t.date)} | ${sign}${formatCurrency(t.amount)} | ${t.categoryEmoji} ${t.description}\n`;
    }
  }

  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(`📜 Extrato — Últimas ${count} transações`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });
}

/**
 * Embed de lista de metas/objetivos.
 */
export function goalsEmbed(goals: Goal[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(COLORS.gold)
    .setTitle('🎯 Seus Objetivos Financeiros')
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });

  if (goals.length === 0) {
    embed.setDescription('*Nenhum objetivo criado ainda.*\n\nUse `!meta criar "Nome" valor` para criar um.');
    return embed;
  }

  for (const goal of goals) {
    const bar = progressBar(goal.currentAmount, goal.targetAmount);
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
    let value = `${bar}\n${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}\nFalta: ${formatCurrency(remaining)}`;

    if (goal.deadline) {
      value += `\nPrazo: ${formatDate(goal.deadline)}`;
    }

    if (goal.currentAmount >= goal.targetAmount) {
      value = `🎉 **CONCLUÍDO!**\n${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}`;
    }

    embed.addFields({ name: `🎯 ${goal.name}`, value, inline: false });
  }

  return embed;
}

/**
 * Embed de confirmação de meta criada.
 */
export function goalCreatedEmbed(goal: Goal): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('🎯 Objetivo criado!')
    .addFields(
      { name: '📌 Nome', value: goal.name, inline: true },
      { name: '💰 Meta', value: formatCurrency(goal.targetAmount), inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });
}

/**
 * Embed de depósito em meta.
 */
export function goalDepositEmbed(goal: Goal, depositAmount: number): EmbedBuilder {
  const bar = progressBar(goal.currentAmount, goal.targetAmount);
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  return new EmbedBuilder()
    .setColor(isCompleted ? COLORS.gold : COLORS.success)
    .setTitle(isCompleted ? '🎉 Objetivo alcançado!' : '💰 Depósito registrado!')
    .addFields(
      { name: '🎯 Objetivo', value: goal.name, inline: true },
      { name: '💵 Depósito', value: formatCurrency(depositAmount), inline: true },
      { name: '📊 Progresso', value: `${bar}\n${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}`, inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });
}

/**
 * Embed de limite definido.
 */
export function limitSetEmbed(category: string, limit: number): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.warning)
    .setTitle('⚠️ Limite de gastos definido!')
    .addFields(
      { name: '📂 Categoria', value: category, inline: true },
      { name: '💰 Limite mensal', value: formatCurrency(limit), inline: true },
    )
    .setDescription('Você será avisado quando ultrapassar esse limite.')
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });
}

/**
 * Embed de transação removida.
 */
export function transactionRemovedEmbed(transaction: Transaction): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.neutral)
    .setTitle('🗑️ Transação removida')
    .addFields(
      { name: '💰 Valor', value: formatCurrency(transaction.amount), inline: true },
      { name: '📂 Categoria', value: `${transaction.categoryEmoji} ${transaction.category}`, inline: true },
      { name: '📝 Descrição', value: transaction.description, inline: false },
    )
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });
}

/**
 * Embed de ajuda com todos os comandos disponíveis.
 */
export function helpEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle('💳 My Wallet — Comandos')
    .setDescription('Seu assistente financeiro pessoal no Discord.\nRegistre transações com linguagem natural ou use os comandos abaixo.')
    .addFields(
      {
        name: '💬 Registro por Mensagem',
        value: [
          '`gastei 50 no mercado` → registra gasto',
          '`paguei 120 de luz` → registra gasto',
          '`recebi 3000 de salário` → registra receita',
          '`uber 25` → registra gasto (detecta categoria)',
          '`mercado R$ 150,00` → registra gasto',
        ].join('\n'),
        inline: false,
      },
      {
        name: '📊 Consultas',
        value: [
          '`/resumo` → resumo do mês atual',
          '`/resumo mes:março` → resumo de um mês específico',
          '`/extrato` → últimas 10 transações',
          '`/extrato quantidade:20` → últimas 20 transações',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🎯 Objetivos',
        value: [
          '`/meta criar nome:Viagem valor:5000` → cria objetivo',
          '`/meta depositar nome:Viagem valor:500` → adiciona progresso',
          '`/meta listar` → lista objetivos',
          '`/meta remover nome:Viagem` → remove objetivo',
        ].join('\n'),
        inline: false,
      },
      {
        name: '⚠️ Limites',
        value: [
          '`/limite categoria:Alimentação valor:800` → define limite mensal',
        ].join('\n'),
        inline: false,
      },
      {
        name: '🛠️ Outros',
        value: [
          '`/apagar` → remove a última transação',
          '`/ajuda` → exibe esta mensagem',
        ].join('\n'),
        inline: false,
      },
      {
        name: '📂 Categorias',
        value: CATEGORIES.filter((c) => c.keywords.length > 0)
          .map((c) => `${c.emoji} ${c.name}`)
          .join(' • '),
        inline: false,
      },
    )
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });
}

/**
 * Embed de boas-vindas.
 */
export function welcomeEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('💳 Olá! Sou o My Wallet')
    .setDescription(
      'Seu assistente financeiro pessoal no Discord.\n\n' +
      'Comece registrando uma transação:\n' +
      '> `gastei 50 no mercado`\n' +
      '> `recebi 3000 de salário`\n\n' +
      'Ou digite `!ajuda` para ver todos os comandos.'
    )
    .setTimestamp()
    .setFooter({ text: 'My Wallet • Assistente Financeiro' });
}
