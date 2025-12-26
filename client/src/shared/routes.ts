export const ROUTES = {
  HOME: "/",
  RECIPES: "/receitas",
  HISTORY: "/historico",
  BADGES: "/badges",
  COMMUNITY: "/comunidade",
  SETTINGS: "/settings",
  UPGRADE_SUCCESS: "/upgrade/sucesso",
  UPGRADE_CANCEL: "/upgrade/cancelado",
  TERMS: "/docs/terms",
  PRIVACY: "/docs/privacy",
  NOT_FOUND: "/404",
  SHOP: "/shop",
};

export type RouteKey = keyof typeof ROUTES;
