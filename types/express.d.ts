/// <reference types="express" />

import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      // Adicione aqui propriedades customizadas no futuro, se precisar
      // user?: any;
    }

    interface Response extends ExpressResponse {}
    interface NextFunction extends ExpressNextFunction {}
  }
}

export {};
