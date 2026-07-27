/**
 * ╔══════════════════════════════════════╗
 * ║   Parser de Linguagem Natural        ║
 * ║   Extrai transações de mensagens     ║
 * ╚══════════════════════════════════════╝
 * 
 * Exemplos de mensagens suportadas:
 * 
 *   "gastei 50 no mercado"       → gasto, R$50,   Alimentação
 *   "paguei 120 de luz"          → gasto, R$120,  Moradia
 *   "recebi 3000 de salário"     → receita, R$3000, Trabalho
 *   "uber 25"                    → gasto, R$25,   Transporte
 *   "mercado R$ 150,00"          → gasto, R$150,  Alimentação
 *   "gastei R$45,90 no ifood"    → gasto, R$45.90, Alimentação
 *   "entrada de 500 freelance"   → receita, R$500, Trabalho
 */

import { detectCategory, Category } from '../data/categories';

export interface ParsedTransaction {
  type: 'gasto' | 'receita';
  amount: number;
  category: Category;
  description: string;
  rawText: string;
}

/**
 * Palavras que indicam GASTO.
 */
const EXPENSE_TRIGGERS = [
  'gastei', 'paguei', 'comprei', 'pago', 'gasto', 'compra',
  'débito', 'debito', 'despesa', 'custo', 'conta',
];

/**
 * Palavras que indicam RECEITA.
 */
const INCOME_TRIGGERS = [
  'recebi', 'ganhei', 'entrou', 'entrada', 'recebido', 'receita',
  'rendimento', 'renda', 'depósito', 'deposito', 'crédito', 'credito',
  'reembolso',
];

/**
 * Extrai um valor monetário de uma string.
 * Suporta formatos: 50, 50.00, 50,00, R$50, R$ 50,00
 * Retorna o valor numérico ou null.
 */
function extractAmount(text: string): number | null {
  // Padrão: R$ 1.234,56 ou R$1234,56 ou 1.234,56 ou 1234,56
  const patterns = [
    /R\$\s*([\d.]+,\d{2})/i,       // R$ 1.234,56
    /R\$\s*([\d.]+)/i,             // R$ 50 ou R$50
    /([\d.]+,\d{2})/,             // 1.234,56
    /(\d+[.,]\d{1,2})/,           // 50.00 ou 50,0
    /(\d+)/,                       // 50
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let value = match[1];
      // Remove pontos de milhar e converte vírgula para ponto decimal
      value = value.replace(/\./g, '').replace(',', '.');
      // Se o resultado não tiver ponto, é um número inteiro
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  }

  return null;
}

/**
 * Remove o valor monetário do texto para extrair a descrição.
 */
function removeAmount(text: string): string {
  return text
    .replace(/R\$\s*[\d.,]+/gi, '')
    .replace(/[\d.,]+/g, '')
    .trim();
}

/**
 * Detecta se a mensagem é um gasto ou receita.
 * Retorna 'gasto', 'receita' ou null se não identificar.
 */
function detectType(text: string): 'gasto' | 'receita' | null {
  const normalized = text.toLowerCase();

  for (const trigger of INCOME_TRIGGERS) {
    if (normalized.includes(trigger)) return 'receita';
  }

  for (const trigger of EXPENSE_TRIGGERS) {
    if (normalized.includes(trigger)) return 'gasto';
  }

  return null;
}

/**
 * Limpa e normaliza a descrição da transação.
 */
function cleanDescription(text: string): string {
  // Remove triggers, preposições comuns e espaços extras
  let desc = text.toLowerCase();

  // Remove triggers de gasto/receita
  for (const trigger of [...EXPENSE_TRIGGERS, ...INCOME_TRIGGERS]) {
    desc = desc.replace(new RegExp(`\\b${trigger}\\b`, 'gi'), '');
  }

  // Remove preposições/artigos comuns que sobram
  desc = desc
    .replace(/\b(no|na|nos|nas|do|da|dos|das|de|em|com|para|pra|pro|pelo|pela|um|uma|uns|umas|o|a|os|as)\b/gi, '')
    .replace(/R\$\s*[\d.,]+/gi, '')
    .replace(/[\d.,]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitaliza a primeira letra
  if (desc.length > 0) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  return desc || 'Sem descrição';
}

/**
 * Tenta parsear uma mensagem como transação financeira.
 * 
 * Retorna null se a mensagem não parecer ser uma transação.
 */
export function parseTransaction(text: string): ParsedTransaction | null {
  const amount = extractAmount(text);

  // Se não tem valor monetário, não é uma transação
  if (amount === null) return null;

  // Detecta tipo (gasto/receita)
  let type = detectType(text);

  // Se não detectou tipo explicitamente, verifica pela categoria
  const category = detectCategory(text);

  if (!type) {
    // Se a categoria é "Trabalho", provavelmente é receita
    if (category.name === 'Trabalho') {
      type = 'receita';
    } else if (category.name !== 'Outros') {
      // Se identificou uma categoria específica, assume gasto
      type = 'gasto';
    } else {
      // Não conseguiu determinar — não parseia
      return null;
    }
  }

  const description = cleanDescription(text);

  return {
    type,
    amount,
    category,
    description,
    rawText: text,
  };
}
