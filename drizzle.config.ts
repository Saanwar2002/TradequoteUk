import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: "gateway01.eu-central-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: "FC8GsaD8hLQ7Yoc.root",
    password: "hHAUj9GVvf7c5qFq",
    database: "test",
    ssl: {
      rejectUnauthorized: true,
    },
  },
});
