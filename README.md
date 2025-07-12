# 🏢 FII Analyzer - Analisador de Fundos Imobiliários

Um software em TypeScript para analisar e comparar Fundos Imobiliários (FIIs) dos principais sites de investimento, identificando os melhores investimentos baseado em múltiplos critérios.

## ✨ Funcionalidades

- **Coleta automática de dados** de 4 fontes principais de FIIs
- **Análise inteligente** baseada em múltiplos critérios:
  - Dividend Yield (40% do score)
  - Preço sobre Valor Patrimonial (P/VP) (30% do score)
  - Preço da cota (20% do score)
  - Liquidez (10% do score)
- **Ranking personalizado** dos melhores FIIs
- **Recomendações automáticas** (BUY/HOLD/SELL)
- **Interface web moderna** com dashboard responsivo
- **Interface de linha de comando** intuitiva
- **Banco de dados SQLite** com Prisma ORM
- **Relatórios detalhados** em formato de tabela
- **Execução rápida** com Bun runtime

## 🚀 Instalação

### Opção 1: Instalação Local (Recomendado)

#### Pré-requisitos

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

4. **Configure as variáveis de ambiente:**
```bash
echo 'DATABASE_URL="file:./src/infrastructure/database/data/fiis.db"' > .env
```

5. **Configure o banco de dados:**
```bash
bun run db:generate
bun run db:push
```

### Opção 2: Docker (Para desenvolvimento)

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd fii-analyzer
```

2. **Execute com Docker Compose:**
```bash
docker-compose up -d
```

3. **Acesse a aplicação:**
- **Interface Web**: http://localhost:3000
- **MongoDB Express**: http://localhost:8081 (admin/fii_password)

## 📖 Como Usar

### Interface Web (Recomendado)
```bash
bun run web
```
Acesse `http://localhost:3000` para ver o dashboard interativo.

### Interface de Linha de Comando

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

# Iniciar interface web
bun run web
```

## 📊 Critérios de Análise

O software utiliza os seguintes critérios para rankear os FIIs:

### Filtros Básicos
- **Dividend Yield mínimo:** 6% ao ano
- **P/VP máximo:** 1.2
- **Preço da cota:** Entre R$ 5 e R$ 200

### Pesos da Análise
- **Dividend Yield:** 40% do score
- **P/VP:** 30% do score  
- **Preço:** 20% do score
- **Liquidez:** 10% do score

### Recomendações
- **BUY:** Score ≥ 0.7
- **HOLD:** Score entre 0.4 e 0.7
- **SELL:** Score < 0.4

## 🏗️ Estrutura do Projeto

```
src/
├── domain/              # Camada de domínio
│   ├── types/          # Interfaces TypeScript
│   └── utils/          # Utilitários
├── application/         # Camada de aplicação
│   ├── scrapers/       # Scrapers para diferentes sites
│   └── analysis/       # Lógica de análise
├── infrastructure/      # Camada de infraestrutura
│   ├── database/       # Banco de dados e repositórios
│   ├── services/       # Serviços de infraestrutura
│   ├── web/           # Interface web (Express)
│   └── config/        # Configurações
└── index.ts           # Ponto de entrada
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev          # Executa em modo desenvolvimento (watch)
bun start            # Executa o projeto
bun run web          # Inicia interface web
bun run build        # Compila o projeto para distribuição

# Banco de dados
bun run db:generate  # Gera cliente Prisma
bun run db:push      # Sincroniza schema com banco
bun run db:migrate   # Cria migration
bun run db:studio    # Abre Prisma Studio

# Docker
docker-compose up -d     # Inicia todos os serviços
docker-compose down      # Para todos os serviços
docker-compose logs      # Visualiza logs
docker-compose restart   # Reinicia serviços

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

### Arquitetura Limpa

O projeto segue os princípios da Clean Architecture:

- **Domain Layer**: Regras de negócio e entidades
- **Application Layer**: Casos de uso e orquestração
- **Infrastructure Layer**: Implementações técnicas

### Banco de Dados

- **SQLite** com Prisma ORM
- **Tabelas principais**: FII, FIIHistory, FIIAnalysis, Alert, Setting
- **Relacionamentos** bem definidos entre entidades
- **Indexes** otimizados para performance
- **Migrations** automáticas

## 📈 Sites Suportados

- **Status Invest** - Dados de dividendos e preços
- **Funds Explorer** - Ranking e análises detalhadas
- **Brapi** - Dados de mercado em tempo real
- **Clube FII** - Análises especializadas

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
