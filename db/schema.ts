// schema.ts
import {
  bigint,
  float,
  singlestoreTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/singlestore-core";

export const commentaryTable = singlestoreTable("commentary_table", {
  id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
  timestamp: timestamp().notNull(),
  commentary: text().notNull(),
  latency: float().notNull(),
  warriors_win_probability: float().notNull(),
  warriors_score: float().notNull(),
  cavaliers_score: float().notNull(),
  game_clock: varchar({ length: 10 }),
});
