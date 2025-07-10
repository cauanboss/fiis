# 🏢 FII Analyzer - Analisador de Fundos Imobiliários

Um software em TypeScript para analisar e comparar Fundos Imobiliários (FIIs) dos principais sites de investimento, identificando os melhores investimentos baseado em múltiplos critérios.

## ✨ Funcionalidades

- **Coleta automática de dados** dos principais sites de FIIs
- **Análise inteligente** baseada em múltiplos critérios:
  - Dividend Yield
  - Preço sobre Valor Patrimonial (P/VP)
  - Preço da cota
  - Histórico de dividendos
- **Ranking personalizado** dos melhores FIIs
- **Recomendações automáticas** (BUY/HOLD/SELL)
- **Interface de linha de comando** intuitiva
- **Relatórios detalhados** em formato de tabela
- **Execução rápida** com Bun runtime

## 🚀 Instalação

### Pré-requisitos

1. **Instale o Bun:**
```bash
curl -fsSL https://bun.sh/install | bash
```

2. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd fii-analyzer
```

3. **Instale as dependências:**
```bash
bun install
```

## 📖 Como Usar

### Comandos Disponíveis

#### 1. Análise Geral (Padrão)
```bash
bun start
# ou
bun run dev
```
Mostra os top 10 FIIs recomendados.

#### 2. Top FIIs
```bash
bun start top
# ou com limite personalizado
bun start top -- --limit 20
```

#### 3. FIIs com Recomendação BUY
```bash
bun start buy
```

#### 4. Análise Detalhada de um FII
```bash
bun start analyze HGLG11
```

#### 5. Resumo Geral
```bash
bun start summary
```

### Exemplos de Uso

```bash
# Ver os 15 melhores FIIs
bun start top -- --limit 15

# Analisar um FII específico
bun start analyze XPML11

# Ver apenas FIIs com recomendação BUY
bun start buy

# Executar em modo desenvolvimento (watch)
bun run dev
```

## 📊 Critérios de Análise

O software utiliza os seguintes critérios para rankear os FIIs:

### Filtros Básicos
- **Dividend Yield mínimo:** 6% ao ano
- **P/VP máximo:** 1.2
- **Preço da cota:** Entre R$ 50 e R$ 200

### Pesos da Análise
- **Dividend Yield:** 50% do score
- **P/VP:** 30% do score  
- **Preço:** 20% do score

### Recomendações
- **BUY:** Score ≥ 0.7
- **HOLD:** Score entre 0.5 e 0.7
- **SELL:** Score < 0.5

## 🏗️ Estrutura do Projeto

```
src/
├── types/           # Interfaces TypeScript
├── scrapers/        # Scrapers para diferentes sites
├── analysis/        # Lógica de análise
├── services/        # Serviços principais
├── utils/           # Utilitários
└── index.ts         # Ponto de entrada
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev          # Executa em modo desenvolvimento (watch)
bun start            # Executa o projeto
bun run build        # Compila o projeto para distribuição

# Qualidade de código
bun run lint         # Executa ESLint
bun run format       # Formata código com Prettier

# Testes
bun test             # Executa testes
```

### Vantagens do Bun

- **Execução mais rápida** que Node.js
- **Suporte nativo a TypeScript** sem necessidade de compilação
- **Gerenciador de pacotes integrado** (npm, yarn, pnpm)
- **Hot reload** automático em desenvolvimento
- **Menor uso de memória**

### Adicionando Novos Scrapers

1. Crie uma nova classe que estenda `BaseScraper`
2. Implemente o método `scrape()`
3. Adicione o scraper ao array em `FIIService`

Exemplo:
```typescript
export class NovoScraper extends BaseScraper {
  constructor() {
    super('https://exemplo.com');
  }

  async scrape(): Promise<ScrapingResult> {
    // Implementação do scraping
  }
}
```

## 📈 Sites Suportados

- **Status Invest** - Dados de dividendos e preços
- **Funds Explorer** - Ranking e análises detalhadas

## ⚠️ Avisos Importantes

1. **Este software é apenas para fins educacionais**
2. **Sempre faça sua própria análise antes de investir**
3. **Os dados são coletados automaticamente e podem conter erros**
4. **Respeite os termos de uso dos sites consultados**

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver sugestões, abra uma issue no GitHub.

---

**⚠️ Disclaimer:** Este software não oferece conselhos de investimento. Sempre consulte um profissional qualificado antes de tomar decisões de investimento.
