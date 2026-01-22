import { TunaBackendSdk } from "../src";
import { createClient } from "../src/client/client";

import "dotenv/config";

export const sdk = new TunaBackendSdk({
  client: createClient({
    baseUrl: process.env.API_BASE_URL!,
    throwOnError: false,
    responseStyle: "fields",
  }),
});
