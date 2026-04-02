import 'express';

declare global {
  namespace Express {
    interface Request {
      // Adicione aqui qualquer extensão que você use (exemplo comum):
      // user?: any;
      // session?: any;
    }

    // Garante que Response e NextFunction também sejam reconhecidos
    interface Response {}
    interface NextFunction {}
  }
}

export {};
