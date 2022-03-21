export const DATABASE_URL: string = process.env.DATABASE_URL || "";
export const NODE_ENV: string = process.env.NODE_ENV;
export const DEV_TOOLS_ENABLED: boolean = ["development", "test"].includes(
  NODE_ENV,
);
