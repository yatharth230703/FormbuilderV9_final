import { pgTable, index, varchar, json, timestamp, bigint, text, foreignKey, pgPolicy, uuid, jsonb, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const session = pgTable("session", {
        sid: varchar().primaryKey().notNull(),
        sess: json().notNull(),
        expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
}, (table) => [
        index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const smoothies = pgTable("smoothies", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "smoothies_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        title: text(),
        method: text(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        rating: bigint({ mode: "number" }),
});

export const formConfig = pgTable("form_config", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "form_config_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        label: text(),
        language: text(),
        config: json(),
        domain: text(),
        userUuid: uuid("user_uuid"),
        promptHistory: jsonb("prompt_history"),
        formConsole: jsonb("form_console").default('{}'),
}, (table) => [
        foreignKey({
                        columns: [table.userUuid],
                        foreignColumns: [users.uuid],
                        name: "form_config_user_uuid_fkey"
                }),
        pgPolicy("form_config_update_own", { as: "permissive", for: "update", to: ["public"], using: sql`(auth.uid() = user_uuid)` }),
        pgPolicy("form_config_select_own", { as: "permissive", for: "select", to: ["public"] }),
        pgPolicy("form_config_insert_own", { as: "permissive", for: "insert", to: ["public"] }),
        pgPolicy("form_config_delete_own", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const formResponses = pgTable("form_responses", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "form_responses_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        label: text(),
        language: text(),
        response: json(),
        domain: text(),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        formConfigId: bigint("form_config_id", { mode: "number" }),
        userUuid: uuid("user_uuid"),
}, (table) => [
        foreignKey({
                        columns: [table.formConfigId],
                        foreignColumns: [formConfig.id],
                        name: "form_config_id_fkey"
                }),
        foreignKey({
                        columns: [table.formConfigId],
                        foreignColumns: [formConfig.id],
                        name: "form_responses_form_config_id_fkey"
                }),
        pgPolicy("form_responses_select_own", { as: "permissive", for: "select", to: ["public"], using: sql`(form_config_id IN ( SELECT form_config.id
   FROM form_config
  WHERE (form_config.user_uuid = auth.uid())))` }),
        pgPolicy("form_responses_insert_public", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const users = pgTable("users", {
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
        createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
        username: text().default(').notNull(),
        email: text().default(').notNull(),
        password: text().default('),
        isAdmin: boolean("is_admin").default(false),
        uuid: uuid(),
        apiKey: text("api_key"),
        // You can use { mode: "bigint" } if numbers are exceeding js number limitations
        credits: bigint({ mode: "number" }),
}, (table) => [
        unique("users_username_key").on(table.username),
        unique("users_email_key").on(table.email),
        unique("users_uuid_key").on(table.uuid),
        pgPolicy("users_update_own", { as: "permissive", for: "update", to: ["public"], using: sql`((auth.uid())::text = (id)::text)` }),
        pgPolicy("users_select_own", { as: "permissive", for: "select", to: ["public"] }),
]);
