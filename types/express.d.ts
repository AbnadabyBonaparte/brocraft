/// <reference types="express" />

import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      // Adicione aqui suas propriedades customizadas se tiver (exemplo):
      // user?: { id: string; email: string; role?: string };
    }

    interface Response extends ExpressResponse {}
    interface NextFunction extends ExpressNextFunction {}
  }
}

export {};
