ALTER TABLE "configuracoes_usuario" ADD COLUMN "provedor_ai" text DEFAULT 'gemini';
ALTER TABLE "configuracoes_usuario" ADD COLUMN "modelo_tier_claude" text DEFAULT 'sonnet';
