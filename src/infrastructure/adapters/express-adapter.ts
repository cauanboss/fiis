import express, { Express, Request, Response, NextFunction } from 'express';
import { WebServerInterface } from '../../domain/interfaces/web-server.interface.js';

export class ExpressAdapter implements WebServerInterface {
    private app: Express;
    private server: ReturnType<Express['listen']> | null = null;

    constructor() {
        this.app = express();
    }

    start(port: number): void {
        this.server = this.app.listen(port, () => {
            console.log(`🌐 Servidor web rodando em http://localhost:${port}`);
        });
    }

    stop(): void {
        if (this.server) {
            this.server.close();
            console.log('🛑 Servidor web parado');
        }
    }

    get(path: string, handler: (req: Request, res: Response) => void): void {
        this.app.get(path, handler);
    }

    post(path: string, handler: (req: Request, res: Response) => void): void {
        this.app.post(path, handler);
    }

    put(path: string, handler: (req: Request, res: Response) => void): void {
        this.app.put(path, handler);
    }

    delete(path: string, handler: (req: Request, res: Response) => void): void {
        this.app.delete(path, handler);
    }

    use(middleware: (req: Request, res: Response, next: NextFunction) => void): void {
        this.app.use(middleware);
    }

    // Método para acessar a instância do Express (para casos específicos)
    getExpressApp(): Express {
        return this.app;
    }
} 