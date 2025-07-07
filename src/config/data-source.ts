import "reflect-metadata";
import { DataSource } from "typeorm";
import { Tenant } from "../entities/Tenant";
import { User } from "../entities/User";

export const createDataSource = (databaseUrl: string, provider: string): DataSource => {
  return new DataSource({
    type: provider as any,
    url: databaseUrl,
    synchronize: false, // We'll use migrations instead
    logging: false,
    entities: [Tenant, User],
    migrations: ["src/migrations/*.ts"],
    subscribers: [],
  });
};

// Default data source for migrations
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || "postgresql://localhost:5432/alok",
  synchronize: false,
  logging: false,
  entities: [Tenant, User],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
}); 