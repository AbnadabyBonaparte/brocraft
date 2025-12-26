import { ROUTES } from "./routes";

export { AXIOS_TIMEOUT_MS, COMMUNITY_CATEGORIES, COMMUNITY_CATEGORY_VALUES, LEADERBOARD_TIMEFRAMES, NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG, VOTE_TYPES, type CommunityCategory, type LeaderboardTimeframe, type VoteType } from "@shared/const";
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";
export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

export const ROUTE_PATHS = ROUTES;

export const UI = {
  APP_TITLE,
  APP_LOGO,
};

export const API = {
  getLoginUrl,
};

export const GAMIFICATION = {
  DIFFICULTY_LEVELS: ["RAJADO", "CLASSICO", "MESTRE"] as const,
};

export { ROUTES };
