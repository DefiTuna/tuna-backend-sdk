import { z } from "zod";

export const Mint = z.object({
  mint: z.string(),
  symbol: z.string(),
  name: z.string(),
  logo: z.string(),
  decimals: z.number(),
});
