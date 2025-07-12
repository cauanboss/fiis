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
- **Sistema de agendamento** para coleta e análise automática
- **Sistema de alertas** com notificações personalizadas
- **Interface web moderna** com dashboard responsivo
- **Interface de linha de comando** intuitiva
- **Banco de dados MongoDB** com Prisma ORM
- **Relatórios detalhados** em formato de tabela
- **Execução rápida** com Bun runtime
- **Testes unitários** completos com Bun Test
- **Clean Architecture** com separação clara de responsabilidades
- **Event-Driven Architecture** com barramento de eventos
- **Dependency Injection** para baixo acoplamento
- **Specification Pattern** para regras de negócio
- **Repository Pattern** para acesso a dados
- **Controller Pattern** para APIs REST

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
echo 'DATABASE_URL="mongodb://localhost:27017/fiis"' > .env
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

#### 1. Análise Manual (Uma vez)
```bash
bun start
# ou
bun run dev
```
Executa uma análise completa uma vez e mostra os resultados.

#### 2. Análise Automática (Contínua)
```bash
bun run start:auto
# ou
bun run scheduler:start
```
Inicia o scheduler que executa análises automaticamente em intervalos configuráveis.

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

## 🧪 Testes

### Executar Todos os Testes
```bash
bun test
```

### Executar Testes em Modo Watch
```bash
bun run test:watch
```

### Executar Testes com Cobertura
```bash
bun run test:coverage
```

### Executar Testes Verbosos
```bash
bun run test:verbose
```

### Testes Específicos
```bash
# Testar sistema de alertas
bun run test:alerts

# Testar casos de uso
bun run test:usecases

# Testar infraestrutura de coleta
bun run test:collection

# Testar scheduler
bun run scheduler:test
```

### Estrutura de Testes
```
src/
├── __tests__/                    # Testes unitários
│   ├── domain/
│   │   ├── specifications/
│   │   │   └── fii-specifications.test.ts
│   │   └── utils/
│   │       └── display.test.ts
│   ├── application/
│   │   ├── analysis/
│   │   │   └── fii-analyzer.test.ts
│   │   ├── services/
│   │   │   └── fii-application-service.test.ts
│   │   └── scrapers/
│   │       └── status-invest-scraper.test.ts
│   └── infrastructure/
│       ├── database/
│       │   └── repositories/
│       │       └── fii-repository.test.ts
│       ├── http/
│       │   └── controllers/
│       │       ├── fii-controller.test.ts
│       │       └── alert-controller.test.ts
│       └── services/
│           └── data-service.test.ts
└── infrastructure/
    └── scripts/                  # Scripts de teste e infraestrutura
        ├── test-alerts.ts
        ├── test-usecases.ts
        ├── test-scheduler.ts
        ├── test-collection-infrastructure.ts
        ├── test-clean-architecture.ts
        └── start-scheduler.ts
```

### Tipos de Testes Implementados

- **Testes Unitários**: Testam funções e classes isoladamente
- **Testes de Integração**: Testam interação entre componentes
- **Testes de Scrapers**: Testam coleta de dados externos
- **Testes de Banco**: Testam operações de dados
- **Testes de Utilitários**: Testam funções auxiliares

## ⏰ Sistema de Agendamento

O FII Analyzer inclui um sistema de agendamento robusto para automatizar a coleta de dados e análise:

### SchedulerService

O `SchedulerService` é responsável por:
- **Coleta automática** de dados de FIIs em intervalos configuráveis
- **Análise automática** dos FIIs coletados
- **Verificação de alertas** em tempo real
- **Logs detalhados** de todas as operações
- **Controle de status** (iniciar/parar/status)

### Configuração

```bash
# Variável de ambiente para controlar frequência
export COLLECTIONS_PER_DAY=4  # 4 coletas por dia (a cada 6 horas)

# Iniciar scheduler
bun run scheduler:start
```

### Vantagens do SchedulerService

✅ **Controle total** sobre execução e configuração  
✅ **Fácil de debugar** e monitorar  
✅ **Pode ser pausado/retomado** dinamicamente  
✅ **Logs detalhados** para troubleshooting  
✅ **Configuração flexível** via variáveis de ambiente  
✅ **Compatível** com a arquitetura atual  

### Alternativas Consideradas

**MongoDB TTL + Change Streams:**
- ❌ Menos flexível para controle
- ❌ Depende do MongoDB (não compatível com Prisma)
- ❌ Difícil de debugar
- ✅ Mais eficiente em recursos
- ✅ Escalável horizontalmente

**Recomendação:** Para este projeto, o `SchedulerService` é a melhor escolha devido ao controle e visibilidade que oferece.

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
│   ├── analysis/       # Lógica de análise
│   └── usecases/       # Casos de uso
├── infrastructure/      # Camada de infraestrutura
│   ├── database/       # Banco de dados e repositórios
│   ├── services/       # Serviços de infraestrutura
│   ├── scripts/        # Scripts de teste e automação
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

# Testes
bun test             # Executa todos os testes
bun run test:watch   # Executa testes em modo watch
bun run test:coverage # Executa testes com cobertura
bun run test:verbose # Executa testes verbosos

# Banco de dados
bun run db:generate  # Gera cliente Prisma
bun run db:push      # Sincroniza schema com banco
bun run db:migrate   # Cria migration
bun run db:studio    # Abre Prisma Studio

# Scheduler e Alertas
bun run scheduler:start  # Inicia scheduler automático
bun run scheduler:test   # Testa funcionalidades do scheduler
bun run start:auto       # Inicia análise automática (mesmo que scheduler:start)

# Docker
docker-compose up -d     # Inicia todos os serviços
docker-compose down      # Para todos os serviços
docker-compose logs      # Visualiza logs
docker-compose restart   # Reinicia serviços

# Qualidade de código
bun run lint         # Executa ESLint
bun run format       # Formata código com Prettier
```

### Vantagens do Bun

- **Execução mais rápida** que Node.js
- **Suporte nativo a TypeScript** sem necessidade de compilação
- **Gerenciador de pacotes integrado** (npm, yarn, pnpm)
- **Hot reload** automático em desenvolvimento
- **Menor uso de memória**
- **Bun Test** integrado para testes rápidos

### Arquitetura Limpa

O projeto segue os princípios da Clean Architecture:

- **Domain Layer**: Regras de negócio, entidades e contratos
- **Application Layer**: Casos de uso, orquestração e serviços de aplicação
- **Infrastructure Layer**: Implementações técnicas, acesso a dados e frameworks

### Padrões Implementados

- **Repository Pattern**: Abstração do acesso a dados
- **Dependency Injection**: Container de injeção de dependência
- **Event-Driven Architecture**: Barramento de eventos
- **Specification Pattern**: Regras de negócio encapsuladas
- **Factory Pattern**: Criação centralizada de objetos
- **Controller Pattern**: APIs REST organizadas

### Banco de Dados

- **MongoDB** com Prisma ORM
- **Tabelas principais**: FII, Alert
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
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Antes de Contribuir

1. **Execute os testes:**
```bash
bun test
```

2. **Verifique a qualidade do código:**
```bash
bun run lint
bun run format
```

3. **Certifique-se de que todos os testes passam:**
```bash
bun run test:coverage
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver sugestões, por favor:

1. Verifique se o problema já foi reportado nas [Issues](../../issues)
2. Crie uma nova issue com detalhes do problema
3. Inclua logs de erro e informações do ambiente

## 🚀 Roadmap

- [ ] Sistema de alertas em tempo real
- [ ] Análise técnica avançada
- [ ] Relatórios em PDF/Excel
- [ ] API pública
- [ ] Mobile app
- [ ] Machine learning para predições
