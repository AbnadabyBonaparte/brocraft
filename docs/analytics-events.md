# BROCRAFT - Analytics Events

Documentação dos eventos de analytics rastreados pelo sistema.

## Formato de Log

Todos os eventos seguem o formato:
```
[BROCRAFT][EVENT] type="event_name" key1="value1" key2=123
```

## Eventos Rastreados

### rank_up
Disparado quando um usuário sobe de rank.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| oldRank | string | Rank anterior |
| newRank | string | Novo rank |
| totalXP | number | XP total acumulado |

### recipe_completed
Disparado quando um usuário completa uma receita.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| recipeId | number | ID da receita |
| category | string | Categoria (CERVEJA, QUEIJO, etc.) |
| difficulty | string | Dificuldade (FACIL, MEDIO, DIFICIL) |
| xpAwarded | number | XP concedido |

### post_created
Disparado quando um usuário cria um post na comunidade.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| postId | number | ID do post |
| category | string | Categoria do post |

### tier_upgrade
Disparado quando um usuário faz upgrade de plano via Stripe.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| newTier | string | Novo tier (MESTRE, CLUBE_BRO) |
| stripeSessionId | string | ID da sessão Stripe |

### limit_reached
Disparado quando um usuário FREE atinge o limite diário de mensagens.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| tier | string | Tier atual (FREE) |
| dailyLimit | number | Limite diário |
| messagesUsed | number | Mensagens usadas |

### badge_earned
Disparado quando um usuário desbloqueia um badge.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| badgeType | string | Tipo do badge |
| badgeName | string | Nome do badge |

### onboarding_step
Disparado quando um usuário completa uma etapa do onboarding.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| step | string | Nome da etapa |
| completed | boolean | Se foi completada |

### chat_message
Disparado quando um usuário envia uma mensagem no chat.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| userId | number | ID do usuário |
| tier | string | Tier atual |
| messagesRemaining | number/string | Mensagens restantes ("unlimited" se ilimitado) |

## Integração Futura

Para integrar com um serviço de analytics real:

1. Escolha o serviço (PostHog, Amplitude, Mixpanel)
2. Instale o SDK: `pnpm add posthog-node`
3. Modifique `server/_core/analytics.ts`:
   - Importe o SDK
   - Inicialize no `initAnalytics()`
   - Substitua `console.log` por chamada ao SDK em `trackEvent()`

Exemplo com PostHog:
```typescript
import { PostHog } from "posthog-node";

let client: PostHog;

export function initAnalytics(): void {
  if (process.env.POSTHOG_API_KEY) {
    client = new PostHog(process.env.POSTHOG_API_KEY);
  }
}

export function trackEvent(eventName: string, payload: EventPayload): void {
  if (client && payload.userId) {
    client.capture({
      distinctId: String(payload.userId),
      event: eventName,
      properties: payload,
    });
  }
}
```

