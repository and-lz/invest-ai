import { z } from "zod/v4";

export const ConclusionItemSchema = z.object({
  text: z.string().min(1).max(500),
  type: z.enum(["positivo", "neutro", "atencao"]),
});

export const ExplainTakeawayRequestSchema = z.object({
  conclusions: z.array(ConclusionItemSchema).min(1).max(10),
});

export type ExplainTakeawayRequest = z.infer<
  typeof ExplainTakeawayRequestSchema
>;
