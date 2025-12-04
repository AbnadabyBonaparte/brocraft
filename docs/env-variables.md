# BROCRAFT - Variáveis de Ambiente

## Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string MySQL | `mysql://user:pass@host:3306/brocraft` |
| `JWT_SECRET` | Secret para tokens JWT (min 32 chars) | `your_super_secret_key` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth Manus | `https://manus.example.com` |
| `BUILT_IN_FORGE_API_KEY` | API key para LLM | `forge_xxx` |
| `BUILT_IN_FORGE_API_URL` | URL da API Forge | `https://api.forge.example.com` |

## Variáveis Opcionais (Graceful Degradation)

### Stripe (Billing)
Se não configuradas, o billing é desabilitado silenciosamente.

| Variável | Descrição |
|----------|-----------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` ou `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret (`whsec_...`) |
| `STRIPE_PRICE_MESTRE` | Price ID do plano MESTRE |
| `STRIPE_PRICE_CLUBE_BRO` | Price ID do plano CLUBE BRO |

### Redis/Upstash (Cache)
Se não configuradas, o cache LLM é desabilitado (maior custo de API).

| Variável | Descrição |
|----------|-----------|
| `UPSTASH_REDIS_URL` | URL do Redis Upstash |
| `UPSTASH_REDIS_TOKEN` | Token de autenticação |

### Monitoring (Sentry)
Se não configuradas, o error tracking é desabilitado.

| Variável | Descrição | Default |
|----------|-----------|---------|
| `SENTRY_DSN` | DSN do projeto Sentry | - |
| `ENABLE_SENTRY` | Habilitar Sentry (`true`/`false`) | `false` |

### Rate Limiting
Configuração de limites por minuto para proteção contra abuso.

| Variável | Descrição | Default |
|----------|-----------|---------|
| `RATE_LIMIT_WINDOW_MS` | Janela de tempo em ms | `60000` (1 min) |
| `RATE_LIMIT_MAX_CHAT` | Limite para chat | `30` |
| `RATE_LIMIT_MAX_BILLING` | Limite para billing | `10` |
| `RATE_LIMIT_MAX_COMMUNITY` | Limite para comunidade | `60` |
| `RATE_LIMIT_DEV` | Ativar rate limit em dev | `false` |

### URLs

| Variável | Descrição | Default |
|----------|-----------|---------|
| `FRONTEND_BASE_URL` | URL base do frontend | `http://localhost:5173` |
| `NODE_ENV` | Ambiente | `development` |
| `GIT_COMMIT` | Hash do commit (CI/CD) | `unknown` |

## Configuração do Stripe Webhook

Para o billing funcionar corretamente em produção:

1. Acesse o [Dashboard Stripe](https://dashboard.stripe.com/webhooks)
2. Crie um webhook apontando para: `https://seu-dominio.com/api/stripe/webhook`
3. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copie o `Signing secret` para `STRIPE_WEBHOOK_SECRET`

## Validação

O servidor valida variáveis críticas no startup:
- Em **desenvolvimento**: loga warnings mas continua
- Em **produção**: falha se variáveis críticas estiverem faltando

Logs de exemplo:
```
[BROCRAFT][ENV] ⚠️ Optional features disabled (missing env vars):
  - Stripe (STRIPE_SECRET_KEY)
  - Redis Cache (UPSTASH_REDIS_URL)
[BROCRAFT][ENV] ✅ Environment validated
```

