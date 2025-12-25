import z from "zod";

export const PoolProvider = {
  ORCA: "orca",
  FUSION: "fusion",
} as const;

export const PoolProviderSchema = z.enum([PoolProvider.ORCA, ...Object.values(PoolProvider)]);

export const Pool = z.object({
  address: z.string(),
  provider: PoolProviderSchema,
  tokenAMint: z.string(),
  tokenBMint: z.string(),
  tokenAVault: z.string(),
  tokenBVault: z.string(),
  tvlUsd: z.coerce.number(),
  tickSpacing: z.number(),
  feeRate: z.number(),
  protocolFeeRate: z.number(),
  olpFeeRate: z.nullable(z.number()),
  liquidity: z.coerce.bigint(),
  sqrtPrice: z.coerce.bigint(),
  price: z.number(),
  tickCurrentIndex: z.number(),
  stats: z.object({
    "24h": z.object({
      volume: z.number(),
      fees: z.number(),
      priceChange: z.number(),
    }),
  }),
});
