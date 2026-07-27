# 💳 My Wallet

> Clareza sobre o seu dinheiro.

Assistente financeiro pessoal que funciona via Discord. Registre gastos, consulte resumos e mantenha controle das suas finanças — tudo por mensagem, usando linguagem natural.

Inspirado no [Pierre](https://pierre.finance), adaptado para uso pessoal no Discord.

## ✨ Funcionalidades

| Feature | Descrição |
|---------|-----------|
| 💬 **Registro natural** | Envie `gastei 50 no mercado` e o bot registra automaticamente |
| 📊 **Resumo mensal** | Veja total gasto, recebido e saldo por categoria |
| 📜 **Extrato** | Consulte suas últimas transações |
| 🎯 **Objetivos** | Crie metas financeiras e acompanhe o progresso |
| ⚠️ **Alertas** | Receba avisos quando ultrapassar limites por categoria |
| 🏷️ **Categorização automática** | Detecta a categoria pelo texto (alimentação, transporte, etc.) |

## 🚀 Setup rápido

### 1. Pré-requisitos
- Node.js 18+ instalado
- Uma conta Discord

### 2. Criar o Bot no Discord

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em **"New Application"** → dê o nome **"My Wallet"** → **Create**
3. No menu lateral, vá em **"Bot"**
4. Clique em **"Reset Token"** → copie o token gerado (guarde bem!)
5. Ative **"Message Content Intent"** (em Privileged Gateway Intents)
6. Salve as alterações

### 3. Convidar o Bot para seu servidor

1. No Developer Portal, vá em **"OAuth2" → "URL Generator"**
2. Em **Scopes**, marque `bot`
3. Em **Bot Permissions**, marque:
   - `Send Messages`
   - `Read Message History`
   - `Embed Links`
4. Copie a URL gerada e abra no navegador
5. Selecione seu servidor e autorize

### 4. Obter seu ID do Discord

1. No Discord, vá em **Configurações → Avançado → Modo Desenvolvedor** (ative)
2. Clique com botão direito no seu nome/avatar → **"Copiar ID do Usuário"**

### 5. Instalar dependências
```bash
npm install
```

### 6. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite o `.env` e preencha:
```
DISCORD_TOKEN=seu_token_aqui
OWNER_DISCORD_ID=seu_id_aqui
```

### 7. Rodar o bot
```bash
npm run dev
```

## 💬 Como Usar

### Registro por Mensagem (linguagem natural)

| Mensagem | O que registra |
|----------|----------------|
| `gastei 50 no mercado` | Gasto de R$50 em Alimentação |
| `paguei 120 de luz` | Gasto de R$120 em Moradia |
| `recebi 3000 de salário` | Receita de R$3000 em Trabalho |
| `uber 25` | Gasto de R$25 em Transporte |
| `mercado R$ 150,00` | Gasto de R$150 em Alimentação |

### Comandos

| Comando | Descrição |
|---------|-----------|
| `/resumo` | Resumo do mês atual |
| `/resumo mes:março` | Resumo de um mês específico |
| `/extrato` | Últimas 10 transações |
| `/extrato quantidade:20` | Últimas 20 transações |
| `/meta criar nome:Viagem valor:5000` | Cria um objetivo financeiro |
| `/meta depositar nome:Viagem valor:500` | Adiciona progresso a um objetivo |
| `/meta listar` | Lista todos os objetivos |
| `/meta remover nome:Viagem` | Remove um objetivo |
| `/limite categoria:Alimentação valor:800` | Define limite mensal para uma categoria |
| `/apagar` | Remove a última transação |
| `/ajuda` | Exibe lista de comandos |

### Categorias automáticas

| Emoji | Categoria | Exemplos de palavras-chave |
|-------|-----------|---------------------------|
| 🍔 | Alimentação | mercado, restaurante, ifood, padaria |
| 🚗 | Transporte | uber, gasolina, estacionamento, metrô |
| 🏠 | Moradia | aluguel, luz, água, internet, condomínio |
| 💊 | Saúde | farmácia, médico, dentista, academia, terapia, óculos |
| 🎭 | Entretenimento | cinema, netflix, jogo, viagem, festa, cassino, aposta, bet, futebol |
| 👕 | Vestuário | roupa, sapato, bolsa, shein, zara |
| 📚 | Educação | curso, faculdade, udemy, inglês |
| 💼 | Trabalho | salário, freelance, comissão |
| 🔄 | Assinaturas | assinatura, plano, celular |
| 📦 | Outros | (quando não identifica) |

## 📁 Estrutura do projeto

```
src/
├── index.ts                 # Ponto de entrada
├── config/
│   └── env.ts               # Variáveis de ambiente
├── data/
│   ├── store.ts             # Persistência JSON (data/wallet.json)
│   └── categories.ts        # Categorias e detecção por keywords
├── finance/
│   ├── parser.ts            # Parser de linguagem natural
│   └── commands.ts          # Lógica dos comandos financeiros
└── discord/
    ├── client.ts            # Conexão Discord + event listeners
    ├── handler.ts           # Router de mensagens
    └── embeds.ts            # Embeds formatados (respostas ricas)
```

## 🔒 Segurança

- Apenas o usuário com ID em `OWNER_DISCORD_ID` pode interagir com o bot
- Token e chaves de API ficam em `.env` (nunca no código)
- Dados financeiros ficam em `data/wallet.json` (local, nunca no git)
- Logs não expõem dados financeiros sensíveis

## 🛠 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Roda em modo desenvolvimento (ts-node) |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Roda a versão compilada |
# Wallet
