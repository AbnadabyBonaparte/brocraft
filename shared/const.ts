export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// =============================================
// COMMUNITY MODULE CONSTANTS
// =============================================

/** Timeframe options for leaderboard */
export const LEADERBOARD_TIMEFRAMES = ["ALL", "DAY", "WEEK", "MONTH"] as const;
export type LeaderboardTimeframe = typeof LEADERBOARD_TIMEFRAMES[number];

/** Community post categories */
export const COMMUNITY_CATEGORIES = [
  { value: "CERVEJA", label: "🍺 Cerveja" },
  { value: "FERMENTADOS", label: "🥒 Fermentados" },
  { value: "LATICINIOS", label: "🧀 Laticínios" },
  { value: "CHARCUTARIA", label: "🥓 Charcutaria" },
  { value: "DICA", label: "💡 Dica" },
  { value: "OUTRO", label: "📝 Outro" },
] as const;

export const COMMUNITY_CATEGORY_VALUES = COMMUNITY_CATEGORIES.map(c => c.value);
export type CommunityCategory = typeof COMMUNITY_CATEGORY_VALUES[number];

/** Vote types */
export const VOTE_TYPES = ["LIKE", "FIRE", "STAR"] as const;
export type VoteType = typeof VOTE_TYPES[number];