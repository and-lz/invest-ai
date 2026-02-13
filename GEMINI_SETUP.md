# Configuração do Google Gemini (Recomendado)

## Por que usar Gemini em vez de Claude?

**Rate Limits Generosos:**
- ✅ **1,500 requests/dia** (gratuito!)
- ✅ 15 requests/minuto
- ✅ 4M tokens/minuto

**Comparado com Claude (tier gratuito):**
- ❌ 50 requests/dia
- ❌ 5 requests/minuto
- ❌ Limite muito fácil de bater com rate limit 429

**Custo:**
- Tier gratuito até 1.5k requests/dia
- Depois: $0.075/1M input tokens, $0.30/1M output tokens
- **Aproximadamente 75% mais barato que Claude Haiku**

## Como Configurar

### 1. Obter API Key do Google

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Faça login com sua conta Google
3. Clique em "Get API Key" ou "Create API Key"
4. Copie a chave gerada

### 2. Configurar variáveis de ambiente

Adicione no seu arquivo `.env.local`:

```bash
# Provider de IA (claude ou gemini)
AI_PROVIDER=gemini

# Google API Key (obtenha em https://aistudio.google.com/apikey)
GOOGLE_API_KEY=sua_chave_aqui
```

### 3. (Opcional) Manter Claude como fallback

Se quiser trocar entre Claude e Gemini facilmente, mantenha ambas as chaves:

```bash
# Provider ativo (mude entre "claude" e "gemini")
AI_PROVIDER=gemini

# Claude API
ANTHROPIC_API_KEY=sua_chave_claude

# Gemini API
GOOGLE_API_KEY=sua_chave_gemini
```

## Voltar para Claude

Se quiser voltar para Claude (não recomendado por causa dos rate limits), basta mudar:

```bash
AI_PROVIDER=claude
```

## Qualidade dos Modelos

| Tarefa | Claude Haiku | Gemini 2.5 Flash | Vencedor |
|--------|--------------|------------------|----------|
| Extração de PDF | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Empate |
| Insights financeiros | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Empate |
| Rate limits | ⭐⭐ | ⭐⭐⭐⭐⭐ | **Gemini** |
| Custo | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Gemini** |
| Velocidade | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Gemini** |

**Conclusão:** Gemini 2.5 Flash oferece qualidade comparável ao Claude Haiku com rate limits 30x maiores e custo menor.

**Nota:** O projeto usa `models/gemini-2.5-flash` (versão mais recente, GA estável).

## Troubleshooting

### Erro: "GOOGLE_API_KEY não configurada"

Certifique-se de:
1. Criar o arquivo `.env.local` na raiz do projeto
2. Adicionar `GOOGLE_API_KEY=sua_chave`
3. Reiniciar o servidor (`npm run dev`)

### Erro 429 (Rate Limit) mesmo com Gemini

Você atingiu o limite de 1500 requests/dia. Opções:
1. Esperar 24h para resetar
2. Criar outra API key com outra conta Google
3. Fazer upgrade para tier pago (muito barato)

### Extração de PDF retorna dados incompletos

Se os insights do Gemini estiverem menos precisos que o Claude:
1. Use `AI_PROVIDER=claude` apenas para extraction
2. Edite `src/lib/container.ts` para usar Gemini só nos insights

```typescript
// Usar Claude para extraction, Gemini para insights
function criarServicoExtracao(): ExtractionService {
  return new ClaudePdfExtractionService(obterClienteAnthropic());
}

function criarServicoInsights(): InsightsService {
  const apiKey = process.env.GOOGLE_API_KEY!;
  return new GeminiInsightsService(apiKey);
}
```
