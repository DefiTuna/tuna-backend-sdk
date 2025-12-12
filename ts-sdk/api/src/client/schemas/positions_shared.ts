import z from "zod";

export const TunaPositionMintSchema = z.object({
  addr: z.string(),
  symbol: z.string(),
  decimals: z.number(),
});

export const TunaPositionPoolSchema = z.object({
  addr: z.string(),
  price: z.number(),
  tickSpacing: z.number(),
});

export const TunaPositionPoolToken = {
  A: "a",
  B: "b",
} as const;
export const TunaPositionPoolTokenSchema = z.enum(Object.values(TunaPositionPoolToken) as [string, ...string[]]);
