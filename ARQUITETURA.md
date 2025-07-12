# Arquitetura do Projeto FII Analyzer

## Estrutura de Pastas

```
fiis/
├── src/                          # Código fonte principal
│   ├── domain/                   # Camada de domínio (Clean Architecture)
│   │   ├── types/               # Interfaces TypeScript
│   │   └── utils/               # Utilitários e helpers
│   ├── application/              # Camada de aplicação (Clean Architecture)
│   │   ├── scrapers/            # Scrapers para coleta de dados
│   │   └── analysis/            # Lógica de análise de FIIs
│   ├── infrastructure/           # Camada de infraestrutura (Clean Architecture)
│   │   ├── database/            # Configuração do banco de dados
│   │   │   ├── prisma/          # Schema e configuração Prisma
│   │   │   ├── data/            # Arquivo SQLite
│   │   │   └── repositories/    # Repositórios de dados
│   │   ├── services/            # Serviços de infraestrutura
│   │   ├── web/                 # Interface web (Express)
│   │   └── config/              # Configurações
│   └── index.ts                 # Ponto de entrada
├── prisma/                       # (Legado) - Movido para src/infrastructure/
└── data/                         # (Legado) - Movido para src/infrastructure/
```

## Camadas da Arquitetura (Clean Architecture)

### 1. Camada de Domínio (`src/domain/`)
- **Responsabilidade**: Regras de negócio e entidades
- **Arquivos**: `types/fii.ts`, `utils/display.ts`
- **Funcionalidades**: 
  - Definição de interfaces e tipos
  - Utilitários de domínio
  - Regras de negócio puras

### 2. Camada de Aplicação (`src/application/`)
- **Responsabilidade**: Casos de uso e orquestração
- **Estrutura**:
  ```
  src/application/
  ├── scrapers/                   # Scrapers para diferentes sites
  │   ├── status-invest-scraper.ts
  │   ├── fundsexplorer-scraper.ts
  │   ├── brapi-scraper.ts
  │   └── clubefii-scraper.ts
  └── analysis/                   # Lógica de análise
      └── fii-analyzer.ts
  ```
- **Funcionalidades**:
  - Coleta de dados de fontes externas
  - Análise e scoring de FIIs
  - Normalização de dados

### 3. Camada de Infraestrutura (`src/infrastructure/`)
- **Responsabilidade**: Implementações técnicas e acesso a dados
- **Estrutura**:
  ```
  src/infrastructure/
  ├── database/                   # Configuração do banco de dados
  │   ├── prisma/                 # Schema Prisma
  │   │   └── schema.prisma       # Definição das tabelas
  │   ├── data/                   # Arquivo SQLite
  │   │   └── fiis.db            # Banco de dados local
  │   ├── repositories/           # Repositórios de dados
  │   │   ├── fiiRepository.ts    # Operações com FIIs
  │   │   ├── alertRepository.ts  # Operações com alertas
  │   │   ├── settingRepository.ts # Operações com configurações
  │   │   └── index.ts           # Exportações
  │   └── database.ts            # Configuração da conexão
  ├── services/                   # Serviços de infraestrutura
  │   ├── dataService.ts         # Serviço de dados
  │   └── fii-service.ts         # Serviço de FIIs
  ├── web/                       # Interface web
  │   └── server.ts              # Servidor Express
  └── config/                    # Configurações
  ```

## Padrões Arquiteturais

### 1. Clean Architecture
- **Separação de responsabilidades** em camadas bem definidas
- **Independência de frameworks** na camada de domínio
- **Testabilidade** facilitada pela inversão de dependências
- **Manutenibilidade** através de regras claras de dependência

### 2. Repository Pattern
- **Localização**: `src/infrastructure/database/repositories/`
- **Benefícios**:
  - Separação de responsabilidades
  - Facilita testes unitários
  - Abstração do banco de dados
  - Interface consistente para acesso a dados

### 3. Singleton Pattern
- **Uso**: `DataService`, `Database`
- **Benefícios**:
  - Controle de conexões
  - Economia de recursos
  - Gerenciamento centralizado de estado

### 4. Strategy Pattern
- **Uso**: Diferentes scrapers implementam a mesma interface
- **Benefícios**:
  - Facilita adição de novas fontes
  - Código modular
  - Polimorfismo para diferentes estratégias de coleta

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

### Relacionamentos
- FII → FIIHistory (1:N)
- FII → FIIAnalysis (1:N)
- FII → Alert (1:N)

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
PORT=3000
```

### Scripts Disponíveis
```bash
bun start          # Executar análise
bun dev            # Modo desenvolvimento
bun web            # Interface web
bun build          # Compilar projeto
bun test           # Executar testes
```

## Benefícios da Arquitetura Limpa

1. **Organização**: Separação clara de responsabilidades
2. **Manutenibilidade**: Código modular e bem estruturado
3. **Escalabilidade**: Fácil adição de novas funcionalidades
4. **Testabilidade**: Camadas bem definidas facilitam testes
5. **Type Safety**: TypeScript em toda a aplicação
6. **Performance**: Prisma com SQLite para dados locais
7. **Flexibilidade**: Fácil troca de implementações

## Princípios de Design

### 1. Dependency Inversion
- Camadas internas não dependem de camadas externas
- Abstrações são definidas na camada de domínio
- Implementações concretas ficam na infraestrutura

### 2. Single Responsibility
- Cada classe tem uma única responsabilidade
- Módulos coesos e bem definidos
- Facilita manutenção e testes

### 3. Open/Closed Principle
- Extensível para novas funcionalidades
- Fechado para modificações desnecessárias
- Novos scrapers podem ser adicionados facilmente

## Próximos Passos

### Curto Prazo
- [ ] Implementar testes unitários
- [ ] Adicionar mais fontes de dados
- [ ] Implementar cache de dados

### Médio Prazo
- [ ] Adicionar autenticação na web
- [ ] Implementar notificações em tempo real
- [ ] Adicionar análise técnica avançada

### Longo Prazo
- [ ] Implementar machine learning
- [ ] Adicionar relatórios avançados
- [ ] Criar API pública
- [ ] Implementar microserviços 