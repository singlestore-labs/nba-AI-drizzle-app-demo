import { drizzle } from "drizzle-orm/singlestore";

if (!process.env.DATABASE_URL) {
  const errorMessage =
    "Environment variable DATABASE_URL is required\nThe DATABASE_URL should look like: singlestore://user:password@host:port/database\nYou can get the connection string from https://portal.singlestore.com/";
  console.error(errorMessage);
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;

export const db = drizzle(DATABASE_URL);
