import { FIIRepositoryInterface } from '../../domain/repositories/fii-repository.interface.js';
import { AlertRepositoryInterface } from '../../domain/repositories/alert-repository.interface.js';
import { EventBusInterface } from '../../domain/interfaces/event-bus.interface.js';

import { RepositoryFactory } from '../factories/repository-factory.js';
import { EventBus } from '../events/event-bus.js';
import { FIIApplicationService } from '../../application/services/fii-application-service.js';
import { FIIController } from '../http/controllers/fii-controller.js';
import { AlertController } from '../http/controllers/alert-controller.js';

export class DependencyContainer {
    private static instance: DependencyContainer;
    private fiiRepository!: FIIRepositoryInterface;
    private alertRepository!: AlertRepositoryInterface;
    private eventBus!: EventBusInterface;
    private fiiApplicationService!: FIIApplicationService;
    private fiiController!: FIIController;
    private alertController!: AlertController;

    private constructor() {
        this.initializeDependencies();
    }

    static getInstance(): DependencyContainer {
        if (!DependencyContainer.instance) {
            DependencyContainer.instance = new DependencyContainer();
        }
        return DependencyContainer.instance;
    }

    private initializeDependencies(): void {
        // 1. Inicializar repositórios
        this.fiiRepository = RepositoryFactory.createFIIRepository();
        this.alertRepository = RepositoryFactory.createAlertRepository();

        // 2. Inicializar EventBus
        this.eventBus = new EventBus();

        // 3. Inicializar Application Service
        this.fiiApplicationService = new FIIApplicationService(
            this.fiiRepository,
            this.alertRepository,
            this.eventBus
        );

        // 4. Inicializar Controllers
        this.fiiController = new FIIController(this.fiiRepository);
        this.alertController = new AlertController(this.fiiRepository, this.alertRepository);

        // 5. Configurar Event Handlers
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // Handler para eventos de coleta
        this.eventBus.subscribe('COLLECTION_COMPLETED', (data) => {
            console.log('📊 Coleta completada:', data);
        });

        // Handler para eventos de análise
        this.eventBus.subscribe('ANALYSIS_COMPLETED', (data) => {
            console.log('📈 Análise completada:', data);
        });

        // Handler para eventos de alerta
        this.eventBus.subscribe('ALERT_TRIGGERED', (data) => {
            console.log('🚨 Alerta disparado:', data);
        });
    }

    // Getters para acessar as dependências
    getFIIRepository(): FIIRepositoryInterface {
        return this.fiiRepository;
    }

    getAlertRepository(): AlertRepositoryInterface {
        return this.alertRepository;
    }

    getEventBus(): EventBusInterface {
        return this.eventBus;
    }

    getFIIApplicationService(): FIIApplicationService {
        return this.fiiApplicationService;
    }

    getFIIController(): FIIController {
        return this.fiiController;
    }

    getAlertController(): AlertController {
        return this.alertController;
    }

    async cleanup(): Promise<void> {
        await RepositoryFactory.disconnect();
        console.log('🧹 Container de dependências limpo');
    }
} 