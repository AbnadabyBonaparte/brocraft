/**
 * Redis Cache Client (Upstash)
 * 
 * Usado para cachear respostas do LLM e economizar custos.
 * Economia estimada: 60-70% em chamadas de IA.
 * 
 * Configuração:
 * - UPSTASH_REDIS_URL: URL do Redis (ex: https://xxx.upstash.io)
 * - UPSTASH_REDIS_TOKEN: Token de autenticação
 * 
 * Se as variáveis não estiverem configuradas, o cache é desabilitado
 * silenciosamente (graceful degradation).
 */

import { ENV } from "./env";

// Tipos
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Configuração
const CACHE_TTL_SECONDS = 3600; // 1 hora
const CACHE_PREFIX = "brocraft:llm:";

// Cliente Redis simples usando Upstash REST API
class UpstashRedisClient {
  private baseUrl: string;
  private token: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.UPSTASH_REDIS_URL || "";
    this.token = process.env.UPSTASH_REDIS_TOKEN || "";
    this.enabled = Boolean(this.baseUrl && this.token);

    if (this.enabled) {
      console.log("[BROCRAFT][Redis] ✅ Cache habilitado (Upstash)");
    } else {
      console.log("[BROCRAFT][Redis] ⚠️ Cache desabilitado (variáveis não configuradas)");
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private async request(command: string[]): Promise<any> {
    if (!this.enabled) return null;

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        console.error("[BROCRAFT][Redis] ❌ Request failed:", response.status);
        return null;
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      // Graceful degradation - log mas não quebra o app
      console.error("[BROCRAFT][Redis] ❌ Error (cache disabled):", error instanceof Error ? error.message : error);
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.request(["GET", key]);
    if (!result) return null;

    try {
      return JSON.parse(result) as T;
    } catch {
      return result as T;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = CACHE_TTL_SECONDS): Promise<boolean> {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    const result = await this.request(["SET", key, serialized, "EX", ttlSeconds.toString()]);
    return result === "OK";
  }

  async del(key: string): Promise<boolean> {
    const result = await this.request(["DEL", key]);
    return result > 0;
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.request(["EXISTS", key]);
    return result > 0;
  }
}

// Singleton
let redisClient: UpstashRedisClient | null = null;

export function getRedisClient(): UpstashRedisClient {
  if (!redisClient) {
    redisClient = new UpstashRedisClient();
  }
  return redisClient;
}

// Função de hash simples para criar chaves de cache
export function hashPrompt(messages: any[]): string {
  // Cria um hash simples baseado no conteúdo das mensagens
  const content = JSON.stringify(messages);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Funções de cache para LLM
export async function getCachedLLMResponse(messages: any[]): Promise<any | null> {
  const client = getRedisClient();
  if (!client.isEnabled()) return null;

  const key = `${CACHE_PREFIX}${hashPrompt(messages)}`;
  const cached = await client.get<any>(key);
  
  if (cached) {
    // Não logar HIT em produção para evitar spam
    if (process.env.NODE_ENV !== "production") {
      console.log("[BROCRAFT][Redis] ✅ Cache HIT");
    }
    return cached;
  }
  
  // Não logar MISS em produção para evitar spam
  if (process.env.NODE_ENV !== "production") {
    console.log("[BROCRAFT][Redis] Cache MISS");
  }
  return null;
}

export async function cacheLLMResponse(messages: any[], response: any): Promise<void> {
  const client = getRedisClient();
  if (!client.isEnabled()) return;

  const key = `${CACHE_PREFIX}${hashPrompt(messages)}`;
  await client.set(key, response, CACHE_TTL_SECONDS);
  // Não logar em produção para evitar spam
  if (process.env.NODE_ENV !== "production") {
    console.log("[BROCRAFT][Redis] 💾 Response cached");
  }
}

// Stats para monitoramento (opcional)
export type CacheStats = {
  enabled: boolean;
  hits: number;
  misses: number;
  hitRate: string;
};

let stats = { hits: 0, misses: 0 };

export function recordCacheHit(): void {
  stats.hits++;
}

export function recordCacheMiss(): void {
  stats.misses++;
}

export function getCacheStats(): CacheStats {
  const total = stats.hits + stats.misses;
  const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(1) + "%" : "N/A";
  
  return {
    enabled: getRedisClient().isEnabled(),
    hits: stats.hits,
    misses: stats.misses,
    hitRate,
  };
}

