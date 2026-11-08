import { createHash } from "crypto";
// A stable private key for IndexNow, made from a secret you already have. Nothing to configure.
export const indexNowKey = () => createHash("sha256").update("indexnow:" + (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "key")).digest("hex").slice(0, 32);
