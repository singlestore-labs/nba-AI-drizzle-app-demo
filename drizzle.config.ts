import dotenv from "dotenv";
import { type Config } from "drizzle-kit";

dotenv.config();

if (!process.env.DATABASE_URL) {
  const errorMessage =
    "Environment variable DATABASE_URL is required\nThe DATABASE_URL should look like: singlestore://user:password@host:port/database\nYou can get the connection string from https://portal.singlestore.com/";
  console.error(errorMessage);
  process.exit(1);
}

export default {
  out: "./drizzle",
  dialect: "singlestore",
  schema: "./db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: ["commentary_table"],
} satisfies Config;
