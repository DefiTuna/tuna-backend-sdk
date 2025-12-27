import z from "zod";

export const TunaPositionPoolToken = {
  A: "a",
  B: "b",
} as const;
export const TunaPositionPoolTokenSchema = z.enum(Object.values(TunaPositionPoolToken) as [string, ...string[]]);
