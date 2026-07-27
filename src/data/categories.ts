/**
 * ╔══════════════════════════════════════╗
 * ║   Categorias de Transações           ║
 * ║   Detecção automática por keywords   ║
 * ╚══════════════════════════════════════╝
 */

export interface Category {
  name: string;
  emoji: string;
  keywords: string[];
}

/**
 * Categorias disponíveis com suas palavras-chave para detecção automática.
 * A ordem importa — a primeira categoria que fizer match é usada.
 */
export const CATEGORIES: Category[] = [
  {
    name: 'Alimentação',
    emoji: '🍔',
    keywords: [
      'mercado', 'supermercado', 'padaria', 'restaurante', 'lanche',
      'almoço', 'almoco', 'jantar', 'café', 'cafe', 'comida', 'pizza',
      'hamburguer', 'hamburger', 'sushi', 'delivery', 'ifood', 'rappi',
      'feira', 'açougue', 'acougue', 'hortifruti', 'carne', 'fruta',
      'verdura', 'bebida', 'cerveja', 'bar', 'lanchonete', 'doceria',
      'sorveteria', 'sorvete', 'marmita', 'quentinha',
    ],
  },
  {
    name: 'Transporte',
    emoji: '🚗',
    keywords: [
      'uber', '99', 'taxi', 'táxi', 'gasolina', 'combustível', 'combustivel',
      'estacionamento', 'pedágio', 'pedagio', 'ônibus', 'onibus', 'metrô',
      'metro', 'trem', 'passagem', 'manutenção carro', 'oficina', 'pneu',
      'óleo', 'oleo', 'lavagem', 'seguro carro', 'ipva', 'multa',
      'bike', 'bicicleta', 'patinete', 'avião', 'voo',
    ],
  },
  {
    name: 'Moradia',
    emoji: '🏠',
    keywords: [
      'aluguel', 'condomínio', 'condominio', 'luz', 'energia', 'água', 'agua',
      'gás', 'gas', 'internet', 'wifi', 'iptu', 'seguro residencial',
      'reforma', 'pintura', 'encanador', 'eletricista', 'limpeza',
      'faxina', 'diarista', 'móveis', 'moveis', 'decoração', 'decoracao',
    ],
  },
  {
    name: 'Saúde',
    emoji: '💊',
    keywords: [
      'farmácia', 'farmacia', 'remédio', 'remedio', 'médico', 'medico',
      'consulta', 'exame', 'dentista', 'hospital', 'plano de saúde',
      'plano de saude', 'academia', 'suplemento', 'psicólogo', 'psicologo',
      'terapia', 'fisioterapia', 'óculos', 'oculos', 'vacina',
    ],
  },
  {
    name: 'Entretenimento',
    emoji: '🎭',
    keywords: [
      'cinema', 'filme', 'netflix', 'spotify', 'disney', 'hbo', 'amazon prime',
      'prime video', 'youtube premium', 'game', 'jogo', 'playstation', 'xbox',
      'nintendo', 'steam', 'show', 'ingresso', 'teatro', 'museu',
      'parque', 'viagem', 'hotel', 'airbnb', 'passeio', 'festa',
      'balada', 'boate', 'streaming', 'livro', 'kindle',
      'cassino', 'aposta', 'bet', 'futebol', 'esporte', 'evento'
    ],
  },
  {
    name: 'Vestuário',
    emoji: '👕',
    keywords: [
      'roupa', 'camisa', 'calça', 'calca', 'tênis', 'tenis', 'sapato',
      'bota', 'chinelo', 'jaqueta', 'casaco', 'vestido', 'saia',
      'bermuda', 'short', 'cueca', 'meia', 'acessório', 'acessorio',
      'relógio', 'relogio', 'bolsa', 'mochila', 'óculos de sol',
      'shein', 'renner', 'riachuelo', 'zara', 'c&a',
    ],
  },
  {
    name: 'Educação',
    emoji: '📚',
    keywords: [
      'curso', 'faculdade', 'universidade', 'escola', 'matrícula', 'matricula',
      'mensalidade', 'material escolar', 'apostila', 'aula', 'professor',
      'inglês', 'ingles', 'idioma', 'udemy', 'alura', 'coursera',
      'certificação', 'certificacao', 'treinamento', 'workshop',
    ],
  },
  {
    name: 'Trabalho',
    emoji: '💼',
    keywords: [
      'salário', 'salario', 'freelance', 'freela', 'pagamento', 'comissão',
      'comissao', 'bônus', 'bonus', 'hora extra', 'renda', 'pro-labore',
      'prolabore', 'dividendo', 'lucro', 'consultoria', 'projeto',
      'cliente', 'nota fiscal',
    ],
  },
  {
    name: 'Assinaturas',
    emoji: '🔄',
    keywords: [
      'assinatura', 'mensalidade', 'plano', 'premium', 'pro',
      'cloud', 'storage', 'icloud', 'google one', 'dropbox',
      'antivírus', 'antivirus', 'vpn', 'domínio', 'dominio',
      'hospedagem', 'celular', 'telefone', 'linha',
    ],
  },
  {
    name: 'Outros',
    emoji: '📦',
    keywords: [],
  },
];

/**
 * Detecta a categoria de uma transação baseada no texto da descrição.
 * Retorna a primeira categoria que tiver match, ou "Outros" como fallback.
 */
export function detectCategory(text: string): Category {
  // Limpa o texto para facilitar a busca exata (sem falsos positivos)
  const cleanText = ` ${text.toLowerCase().replace(/[.,!?;:()]/g, ' ')} `;

  for (const category of CATEGORIES) {
    for (const keyword of category.keywords) {
      // Busca a palavra-chave com espaços ao redor, para garantir
      // que é a palavra inteira. Ex: " gas " não vai bater em " gastei ".
      if (cleanText.includes(` ${keyword} `)) {
        return category;
      }
    }
  }

  // Fallback: categoria "Outros"
  return CATEGORIES[CATEGORIES.length - 1];
}

/**
 * Busca uma categoria pelo nome (case-insensitive).
 * Retorna undefined se não encontrar.
 */
export function findCategoryByName(name: string): Category | undefined {
  const normalized = name.toLowerCase();
  return CATEGORIES.find(
    (c) => c.name.toLowerCase() === normalized || c.emoji === name
  );
}

/**
 * Retorna todas as categorias formatadas para exibição.
 */
export function listCategories(): string {
  return CATEGORIES.map((c) => `${c.emoji} ${c.name}`).join('\n');
}
