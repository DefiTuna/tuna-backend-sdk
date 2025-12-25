import { z } from "zod";

export const AmountWithUsdSchema = z.object({
  amount: z.coerce.bigint(),
  usd: z.number(),
});

export const AmountWithoutUsdSchema = z.object({
  amount: z.coerce.bigint(),
});

export const TokensPnlSchema = z.object({
  amount: z.coerce.bigint(),
  rate: z.number(),
});

export const UsdPnlSchema = z.object({
  amount: z.number(),
  rate: z.number(),
});
