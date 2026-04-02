/// <reference types="express" />

import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      // Aqui você pode adicionar propriedades customizadas no futuro (ex: user)
      // user?: { id: string; email: string };
    }

    interface Response extends ExpressResponse {}
    interface NextFunction extends ExpressNextFunction {}
  }
}

export {};
