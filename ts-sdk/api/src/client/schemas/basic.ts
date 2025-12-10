import { z } from "zod";

export const AmountWithUsdSchema = z.object({
  amount: z.coerce.bigint(),
  usd: z.number(),
});

export const TokensPnlSchema = z.object({
  amount: z.coerce.bigint(),
  bps: z.number(),
});

export const UsdPnlSchema = z.object({
  amount: z.number(),
  bps: z.number(),
});

export const PoolProvider = {
  ORCA: "orca",
  FUSION: "fusion",
} as const;

export const PoolProviderSchema = z.enum([PoolProvider.ORCA, ...Object.values(PoolProvider)]);
