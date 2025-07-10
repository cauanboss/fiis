# Arquitetura do Projeto FII Analyzer

## Estrutura de Pastas

```
fiis/
├── src/                          # Código fonte principal
│   ├── analysis/                 # Lógica de análise de FIIs
│   ├── scrapers/                 # Scrapers para coleta de dados
│   ├── services/                 # Serviços de negócio
│   ├── types/                    # Definições de tipos TypeScript
│   ├── utils/                    # Utilitários e helpers
│   ├── web/                      # Interface web (Express)
│   └── infrastructure/           # Camada de infraestrutura
│       └── database/             # Configuração do banco de dados
│           ├── data/             # Arquivos do banco SQLite
│           ├── prisma/           # Schema e configuração Prisma
│           └── repositories/     # Repositórios de dados
├── prisma/                       # (Legado) - Movido para src/infrastructure/
└── data/                         # (Legado) - Movido para src/infrastructure/
```

## Camadas da Arquitetura

### 1. Camada de Apresentação (`src/web/`)
- **Responsabilidade**: Interface web e APIs REST
- **Tecnologias**: Express.js, HTML/CSS/JavaScript
- **Arquivos**: `server.ts`, templates HTML

### 2. Camada de Serviços (`src/services/`)
- **Responsabilidade**: Lógica de negócio e orquestração
- **Arquivos**: `dataService.ts`, `fii-service.ts`
- **Funcionalidades**: 
  - Gerenciamento de dados
  - Análise de FIIs
  - Sistema de alertas

### 3. Camada de Análise (`src/analysis/`)
- **Responsabilidade**: Algoritmos de análise e scoring
- **Arquivos**: `fii-analyzer.ts`
- **Funcionalidades**:
  - Cálculo de scores
  - Recomendações (BUY/HOLD/SELL)
  - Análise por setor

### 4. Camada de Coleta (`src/scrapers/`)
- **Responsabilidade**: Coleta de dados de fontes externas
- **Arquivos**: `fundsexplorer-scraper.ts`, `clubefii-scraper.ts`, etc.
- **Funcionalidades**:
  - Scraping de sites de FIIs
  - Normalização de dados
  - Tratamento de erros

### 5. Camada de Infraestrutura (`src/infrastructure/`)
- **Responsabilidade**: Configuração e persistência de dados
- **Estrutura**:
  ```
  src/infrastructure/
  ├── database/
  │   ├── data/                   # Arquivos do banco SQLite
  │   ├── prisma/                 # Schema Prisma
  │   │   └── schema.prisma       # Definição das tabelas
  │   ├── repositories/           # Repositórios de dados
  │   │   ├── fiiRepository.ts    # Operações com FIIs
  │   │   ├── alertRepository.ts  # Operações com alertas
  │   │   ├── settingRepository.ts # Operações com configurações
  │   │   └── index.ts           # Exportações
  │   └── database.ts            # Configuração da conexão
  ```

## Padrões Arquiteturais

### 1. Repository Pattern
- **Localização**: `src/infrastructure/database/repositories/`
- **Benefícios**:
  - Separação de responsabilidades
  - Facilita testes unitários
  - Abstração do banco de dados

### 2. Singleton Pattern
- **Uso**: `DataService`, `Database`
- **Benefícios**:
  - Controle de conexões
  - Economia de recursos

### 3. Strategy Pattern
- **Uso**: Diferentes scrapers implementam a mesma interface
- **Benefícios**:
  - Facilita adição de novas fontes
  - Código modular

## Banco de Dados

### Schema Prisma
```sql
-- Tabelas principais
FII              # Dados atuais dos FIIs
FIIHistory       # Histórico de preços e dividendos
FIIAnalysis      # Análises e recomendações
Alert            # Sistema de alertas
Setting          # Configurações do sistema
```

### Comandos do Banco
```bash
# Gerar cliente Prisma
bun run db:generate

# Sincronizar schema com banco
bun run db:push

# Criar migration
bun run db:migrate

# Abrir Prisma Studio
bun run db:studio
```

## Fluxo de Dados

1. **Coleta**: Scrapers coletam dados de sites
2. **Processamento**: DataService normaliza e salva dados
3. **Análise**: FIIAnalyzer calcula scores e recomendações
4. **Persistência**: Repositórios salvam no banco SQLite
5. **Apresentação**: Interface web exibe resultados

## Configuração

### Variáveis de Ambiente
```env
DATABASE_URL="file:./src/infrastructure/database/data/fiis.db"
```

### Scripts Disponíveis
```bash
bun start          # Executar análise
bun dev            # Modo desenvolvimento
bun build          # Compilar projeto
bun test           # Executar testes
```

## Benefícios da Nova Estrutura

1. **Organização**: Separação clara de responsabilidades
2. **Manutenibilidade**: Código modular e bem estruturado
3. **Escalabilidade**: Fácil adição de novas funcionalidades
4. **Testabilidade**: Camadas bem definidas facilitam testes
5. **Type Safety**: TypeScript em toda a aplicação
6. **Performance**: Prisma com SQLite para dados locais

## Próximos Passos

- [ ] Implementar testes unitários
- [ ] Adicionar mais fontes de dados
- [ ] Implementar cache de dados
- [ ] Adicionar autenticação na web
- [ ] Implementar notificações em tempo real
- [ ] Adicionar análise técnica avançada 