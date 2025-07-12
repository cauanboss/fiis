# Arquitetura do Projeto FII Analyzer

## Estrutura de Pastas

```
fiis/
├── src/                          # Código fonte principal
│   ├── domain/                   # Camada de domínio (Clean Architecture)
│   │   ├── entities/            # Entidades de domínio
│   │   ├── interfaces/          # Interfaces e contratos
│   │   ├── repositories/        # Interfaces de repositórios
│   │   ├── services/            # Serviços de domínio
│   │   ├── specifications/      # Regras de negócio (Specification Pattern)
│   │   ├── events/              # Eventos de domínio
│   │   ├── value-objects/       # Objetos de valor
│   │   ├── types/               # Interfaces TypeScript
│   │   └── utils/               # Utilitários e helpers
│   ├── application/              # Camada de aplicação (Clean Architecture)
│   │   ├── services/            # Serviços de aplicação
│   │   ├── usecases/            # Casos de uso
│   │   ├── factories/           # Factories para criação de objetos
│   │   ├── scrapers/            # Scrapers para coleta de dados
│   │   └── analysis/            # Lógica de análise de FIIs
│   ├── infrastructure/           # Camada de infraestrutura (Clean Architecture)
│   │   ├── config/              # Configurações e DI Container
│   │   ├── database/            # Configuração do banco de dados
│   │   │   ├── prisma/          # Schema e configuração Prisma
│   │   │   ├── data/            # Arquivo MongoDB
│   │   │   └── repositories/    # Repositórios de dados
│   │   ├── services/            # Serviços de infraestrutura
│   │   ├── http/                # Controllers e servidor HTTP
│   │   ├── events/              # Implementação do EventBus
│   │   ├── factories/           # Factories de infraestrutura
│   │   └── adapters/            # Adaptadores para frameworks
│   └── index.ts                 # Ponto de entrada
├── prisma/                       # Schema Prisma
└── scripts/                      # Scripts de teste e utilitários
```

## Camadas da Arquitetura (Clean Architecture)

### 1. Camada de Domínio (`src/domain/`)
- **Responsabilidade**: Regras de negócio, entidades e contratos
- **Estrutura**:
  ```
  src/domain/
  ├── entities/                   # Entidades de domínio
  │   ├── fii-portfolio.ts       # Agregado de portfólio
  │   └── alert.ts               # Entidade de alerta
  ├── interfaces/                 # Interfaces e contratos
  │   ├── event-bus.interface.ts # Interface do EventBus
  │   ├── notification.interface.ts # Interface de notificação
  │   ├── unit-of-work.interface.ts # Interface Unit of Work
  │   └── web-server.interface.ts # Interface do servidor web
  ├── repositories/               # Interfaces de repositórios
  │   ├── fii-repository.interface.ts
  │   ├── alert-repository.interface.ts
  │   └── scraper-repository.interface.ts
  ├── services/                   # Serviços de domínio
  │   ├── fii-analysis-service.ts # Análise de FIIs
  │   └── notification-service.ts # Notificações
  ├── specifications/             # Regras de negócio
  │   └── fii-specifications.ts  # Specifications para FIIs
  ├── events/                     # Eventos de domínio
  │   └── domain-events.ts       # Eventos de domínio
  ├── value-objects/              # Objetos de valor
  ├── types/                      # Interfaces TypeScript
  └── utils/                      # Utilitários e helpers
  ```

### 2. Camada de Aplicação (`src/application/`)
- **Responsabilidade**: Casos de uso, orquestração e serviços de aplicação
- **Estrutura**:
  ```
  src/application/
  ├── services/                   # Serviços de aplicação
  │   └── fii-application-service.ts # Orquestrador principal
  ├── usecases/                   # Casos de uso
  │   ├── collect-fiis-data.usecase.ts
  │   ├── analyze-fiis.usecase.ts
  │   ├── check-alerts.usecase.ts
  │   └── create-alert.usecase.ts
  ├── factories/                   # Factories
  │   └── scraper-factory.ts      # Factory de scrapers
  ├── scrapers/                    # Scrapers para diferentes sites
  │   ├── base-scraper.ts         # Classe base para scrapers
  │   ├── status-invest-scraper.ts
  │   ├── fundsexplorer-scraper.ts
  │   └── clubefii-scraper.ts
  └── analysis/                    # Lógica de análise
      └── fii-analyzer.ts
  ```

### 3. Camada de Infraestrutura (`src/infrastructure/`)
- **Responsabilidade**: Implementações técnicas, acesso a dados e frameworks
- **Estrutura**:
  ```
  src/infrastructure/
  ├── config/                      # Configurações e DI Container
  │   └── dependency-container.ts  # Container de injeção de dependência
  ├── database/                    # Configuração do banco de dados
  │   ├── prisma/                  # Schema Prisma
  │   │   └── schema.prisma        # Definição das tabelas
  │   ├── data/                    # Arquivo MongoDB
  │   ├── repositories/            # Repositórios de dados
  │   │   ├── fiiRepository.ts     # Operações com FIIs
  │   │   ├── alertRepository.ts   # Operações com alertas
  │   │   └── index.ts            # Exportações
  │   └── database.ts             # Configuração da conexão
  ├── services/                    # Serviços de infraestrutura
  │   ├── dataService.ts          # Serviço de dados
  │   ├── scheduler-service.ts     # Serviço de agendamento
  │   └── fii-service.ts          # Serviço de FIIs
  ├── http/                        # Controllers e servidor HTTP
  │   ├── controllers/             # Controllers REST
  │   │   ├── fii-controller.ts   # Controller de FIIs
  │   │   └── alert-controller.ts # Controller de alertas
  │   ├── web-server.ts           # Servidor Express
  │   └── adapters/               # Adaptadores
  │       └── express-adapter.ts  # Adaptador Express
  ├── events/                      # Implementação do EventBus
  │   └── event-bus.ts            # Barramento de eventos
  ├── factories/                   # Factories de infraestrutura
  │   └── repository-factory.ts   # Factory de repositórios
  └── adapters/                    # Adaptadores para frameworks
  ```

## Padrões Arquiteturais Implementados

### 1. Clean Architecture
- **Separação de responsabilidades** em camadas bem definidas
- **Independência de frameworks** na camada de domínio
- **Testabilidade** facilitada pela inversão de dependências
- **Manutenibilidade** através de regras claras de dependência

### 2. Repository Pattern
- **Localização**: `src/infrastructure/repository/`
- **Interfaces**: `src/domain/repositories/`
- **Benefícios**:
  - Separação de responsabilidades
  - Facilita testes unitários
  - Abstração do banco de dados
  - Interface consistente para acesso a dados

### 3. Dependency Injection
- **Container**: `DependencyContainer` em `src/infrastructure/config/`
- **Benefícios**:
  - Controle de dependências
  - Facilita testes
  - Baixo acoplamento
  - Inversão de controle

### 4. Event-Driven Architecture
- **EventBus**: Implementação em `src/infrastructure/events/`
- **Domain Events**: `src/domain/events/`
- **Benefícios**:
  - Desacoplamento entre componentes
  - Escalabilidade
  - Facilita extensões

### 5. Specification Pattern
- **Localização**: `src/domain/specifications/`
- **Benefícios**:
  - Regras de negócio encapsuladas
  - Composição de regras
  - Reutilização de lógica

### 6. Factory Pattern
- **ScraperFactory**: `src/application/factories/`
- **RepositoryFactory**: `src/infrastructure/factories/`
- **Benefícios**:
  - Criação centralizada de objetos
  - Flexibilidade na criação
  - Encapsulamento da lógica de criação

### 7. Controller Pattern
- **Localização**: `src/infrastructure/http/controllers/`
- **Benefícios**:
  - Separação de responsabilidades HTTP
  - Código organizado e testável
  - Padrão REST consistente

## Banco de Dados

### Schema Prisma (MongoDB)
```prisma
// Tabelas principais
model FII {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  ticker          String   @unique
  name            String
  price           Float
  dividendYield   Float
  pvp             Float
  lastDividend    Float
  dividendYield12m Float
  priceVariation  Float
  source          String
  lastUpdate      DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Alert {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  ticker      String
  type        String
  condition   String
  value       Float
  message     String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
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

## Fluxo de Dados Atualizado

1. **Coleta**: Scrapers coletam dados de sites
2. **Eventos**: EventBus publica eventos de coleta
3. **Processamento**: DataService normaliza e salva dados
4. **Análise**: FIIAnalyzer calcula scores e recomendações
5. **Specifications**: Regras de negócio aplicadas
6. **Persistência**: Repositórios salvam no banco MongoDB
7. **Apresentação**: Controllers REST expõem dados

## Configuração

### Variáveis de Ambiente
```env
DATABASE_URL="mongodb://localhost:27017/fiis"
PORT=3000
COLLECTIONS_PER_DAY=4
```

### Scripts Disponíveis
```bash
bun start          # Executar análise
bun dev            # Modo desenvolvimento
bun web            # Interface web
bun build          # Compilar projeto
bun test           # Executar testes
bun test:clean     # Testar Clean Architecture
```

## Benefícios da Arquitetura Limpa Atualizada

1. **Organização**: Separação clara de responsabilidades
2. **Manutenibilidade**: Código modular e bem estruturado
3. **Escalabilidade**: Fácil adição de novas funcionalidades
4. **Testabilidade**: Camadas bem definidas facilitam testes
5. **Type Safety**: TypeScript em toda a aplicação
6. **Performance**: MongoDB para dados escaláveis
7. **Flexibilidade**: Fácil troca de implementações
8. **Event-Driven**: Arquitetura orientada a eventos
9. **Dependency Injection**: Controle de dependências
10. **Specifications**: Regras de negócio encapsuladas

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

### 4. Interface Segregation
- Interfaces específicas para cada responsabilidade
- Evita dependências desnecessárias
- Facilita implementações parciais

### 5. Composition over Inheritance
- Uso de composição para reutilização
- Specifications combináveis
- Event handlers modulares

## Componentes Implementados

### ✅ Totalmente Implementados
- **DependencyContainer**: Container de injeção de dependência
- **EventBus**: Barramento de eventos
- **Specifications**: Regras de negócio (HighDividendYield, LowPVP, etc.)
- **Controllers**: Controllers HTTP REST
- **Factories**: Factories para criação de objetos
- **Domain Events**: Eventos de domínio estruturados
- **Application Service**: Orquestrador de casos de uso

### ⚠️ Parcialmente Implementados
- **Unit of Work**: Interface criada, implementação pendente
- **Domain Services**: Básicos implementados
- **Value Objects**: Estrutura criada

### 📋 Próximos Passos

#### Curto Prazo
- [ ] Implementar Unit of Work
- [ ] Adicionar mais Specifications
- [ ] Implementar testes unitários
- [ ] Conectar Domain Events aos use cases

#### Médio Prazo
- [ ] Implementar CQRS
- [ ] Adicionar mais Domain Services
- [ ] Implementar notificações em tempo real
- [ ] Adicionar análise técnica avançada

#### Longo Prazo
- [ ] Implementar machine learning
- [ ] Adicionar relatórios avançados
- [ ] Criar API pública
- [ ] Implementar microserviços 