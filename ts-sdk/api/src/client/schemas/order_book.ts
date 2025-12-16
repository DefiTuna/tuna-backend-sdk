import z from "zod";

export const OrderBookEntry = z.object({
  concentratedAmount: z.coerce.bigint(),
  concentratedAmountQuote: z.coerce.bigint(),
  concentratedTotal: z.coerce.bigint(),
  concentratedTotalQuote: z.coerce.bigint(),
  limitAmount: z.coerce.bigint(),
  limitAmountQuote: z.coerce.bigint(),
  limitTotal: z.coerce.bigint(),
  limitTotalQuote: z.coerce.bigint(),
  price: z.number(),
  askSide: z.boolean(),
});

export const OrderBook = z.object({
  entries: OrderBookEntry.array(),
  poolPrice: z.number(),
});
