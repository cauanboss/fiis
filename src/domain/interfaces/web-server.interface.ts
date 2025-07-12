import { Request, Response, NextFunction } from 'express';

export interface WebServerInterface {
    start(port: number): void;
    stop(): void;
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
    put(path: string, handler: (req: Request, res: Response) => void): void;
    delete(path: string, handler: (req: Request, res: Response) => void): void;
    use(middleware: (req: Request, res: Response, next: NextFunction) => void): void;
} 