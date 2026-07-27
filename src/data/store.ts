/**
 * ╔══════════════════════════════════════╗
 * ║   Store — Persistência de Dados      ║
 * ║   Armazenamento local em JSON        ║
 * ╚══════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';

// ─── Interfaces ──────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: 'gasto' | 'receita';
  amount: number;
  category: string;
  categoryEmoji: string;
  description: string;
  date: string; // ISO 8601
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null; // ISO 8601 ou null
  createdAt: string;
}

export interface SpendingLimit {
  category: string;
  limit: number;
}

export interface WalletData {
  transactions: Transaction[];
  goals: Goal[];
  limits: SpendingLimit[];
}

// ─── Caminho do arquivo de dados ─────────────────────────────────

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'wallet.json');

// ─── Funções de Persistência ─────────────────────────────────────

/**
 * Carrega os dados do arquivo JSON.
 * Se o arquivo não existir, retorna um objeto vazio padrão.
 */
export function loadData(): WalletData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { transactions: [], goals: [], limits: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as WalletData;
  } catch {
    console.error('⚠️  Erro ao ler wallet.json — usando dados vazios.');
    return { transactions: [], goals: [], limits: [] };
  }
}

/**
 * Salva os dados no arquivo JSON.
 * Cria o diretório `data/` se não existir.
 */
export function saveData(data: WalletData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Transações ──────────────────────────────────────────────────

/**
 * Gera um ID único simples (timestamp + random).
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Adiciona uma transação e salva.
 * Retorna a transação criada.
 */
export function addTransaction(
  type: 'gasto' | 'receita',
  amount: number,
  category: string,
  categoryEmoji: string,
  description: string
): Transaction {
  const data = loadData();
  const transaction: Transaction = {
    id: generateId(),
    type,
    amount,
    category,
    categoryEmoji,
    description,
    date: new Date().toISOString(),
  };
  data.transactions.push(transaction);
  saveData(data);
  return transaction;
}

/**
 * Remove a última transação registrada.
 * Retorna a transação removida ou null se não houver.
 */
export function removeLastTransaction(): Transaction | null {
  const data = loadData();
  if (data.transactions.length === 0) return null;
  const removed = data.transactions.pop()!;
  saveData(data);
  return removed;
}

/**
 * Retorna as últimas N transações (mais recentes primeiro).
 */
export function getLastTransactions(count: number = 10): Transaction[] {
  const data = loadData();
  return data.transactions.slice(-count).reverse();
}

/**
 * Retorna todas as transações de um mês/ano específico.
 * @param month 0-indexed (0 = Janeiro)
 * @param year Ano completo (ex: 2026)
 */
export function getTransactionsByMonth(month: number, year: number): Transaction[] {
  const data = loadData();
  return data.transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

// ─── Metas / Objetivos ──────────────────────────────────────────

/**
 * Cria um novo objetivo financeiro.
 */
export function addGoal(name: string, targetAmount: number, deadline: string | null = null): Goal {
  const data = loadData();
  const goal: Goal = {
    id: generateId(),
    name,
    targetAmount,
    currentAmount: 0,
    deadline,
    createdAt: new Date().toISOString(),
  };
  data.goals.push(goal);
  saveData(data);
  return goal;
}

/**
 * Deposita valor em um objetivo existente (busca por nome, case-insensitive).
 * Retorna o objetivo atualizado ou null se não encontrar.
 */
export function depositToGoal(name: string, amount: number): Goal | null {
  const data = loadData();
  const goal = data.goals.find(
    (g) => g.name.toLowerCase() === name.toLowerCase()
  );
  if (!goal) return null;
  goal.currentAmount += amount;
  saveData(data);
  return goal;
}

/**
 * Retorna todas as metas.
 */
export function getGoals(): Goal[] {
  const data = loadData();
  return data.goals;
}

/**
 * Remove um objetivo por nome.
 */
export function removeGoal(name: string): Goal | null {
  const data = loadData();
  const index = data.goals.findIndex(
    (g) => g.name.toLowerCase() === name.toLowerCase()
  );
  if (index === -1) return null;
  const [removed] = data.goals.splice(index, 1);
  saveData(data);
  return removed;
}

// ─── Limites de Gastos ──────────────────────────────────────────

/**
 * Define ou atualiza o limite de gastos para uma categoria.
 */
export function setSpendingLimit(category: string, limit: number): void {
  const data = loadData();
  const existing = data.limits.find(
    (l) => l.category.toLowerCase() === category.toLowerCase()
  );
  if (existing) {
    existing.limit = limit;
  } else {
    data.limits.push({ category, limit });
  }
  saveData(data);
}

/**
 * Retorna o limite de gastos de uma categoria, ou null se não definido.
 */
export function getSpendingLimit(category: string): number | null {
  const data = loadData();
  const found = data.limits.find(
    (l) => l.category.toLowerCase() === category.toLowerCase()
  );
  return found ? found.limit : null;
}

/**
 * Retorna todos os limites definidos.
 */
export function getAllLimits(): SpendingLimit[] {
  const data = loadData();
  return data.limits;
}
