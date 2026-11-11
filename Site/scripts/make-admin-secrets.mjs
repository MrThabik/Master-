// Usage: node scripts/make-admin-secrets.mjs <username> "<password>" <pin>
// Prints the environment variables for Vercel / .env.local. Nothing is stored anywhere else.
import { randomBytes, scryptSync } from "crypto";

const [, , rawUser, rawPass, rawPin] = process.argv;
const user = (rawUser ?? "").trim().toLowerCase(), pass = (rawPass ?? "").trim(), pin = (rawPin ?? "").trim();
if (!user || !pass || !pin) {
  console.log('Usage: node scripts/make-admin-secrets.mjs <username> "<password>" <pin>');
  process.exit(1);
}
if (pass.length < 10) { console.log("Password must be at least 10 characters."); process.exit(1); }
if (!/^\d{6,12}$/.test(pin)) { console.log("PIN must be 6 to 12 digits (8 or more is better)."); process.exit(1); }

const hash = (s) => { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(s, salt, 64).toString("hex")}`; };

console.log(`ADMIN_USERNAME=${user}`);
console.log(`ADMIN_PASSWORD_HASH=${hash(pass)}`);
console.log(`ADMIN_PIN_HASH=${hash(pin)}`);
console.log(`ADMIN_SUPABASE_PASSWORD=${randomBytes(24).toString("base64url")}`);
console.log("\nNext: in Supabase > Authentication > Users, set the Master user's password to ADMIN_SUPABASE_PASSWORD.");
