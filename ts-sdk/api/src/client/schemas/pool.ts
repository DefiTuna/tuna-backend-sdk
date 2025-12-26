import z from "zod";

import { Mint } from "./mint";

export const PoolProvider = {
  ORCA: "orca",
  FUSION: "fusion",
} as const;

export const PoolProviderSchema = z.enum([PoolProvider.ORCA, ...Object.values(PoolProvider)]);

export const Pool = z.object({
  address: z.string(),
  provider: PoolProviderSchema,
  mintA: Mint,
  mintB: Mint,
  tokenAVault: z.string(),
  tokenBVault: z.string(),
  tickSpacing: z.number(),
  feeRate: z.number(),
  protocolFeeRate: z.number(),
  olpFeeRate: z.nullable(z.number()),
  liquidity: z.coerce.bigint(),
  sqrtPrice: z.coerce.bigint(),
  price: z.number(),
  tickCurrentIndex: z.number(),
  stats: z.optional(
    z.object({
      tvlUsd: z.coerce.number(),
      groups: z.object({
        "24h": z.object({
          volumeUsd: z.number(),
          feesUsd: z.number(),
          priceChange: z.number(),
        }),
      }),
    }),
  ),
});
