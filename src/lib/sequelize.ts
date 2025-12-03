import { getEnvironmentVariable } from "@/utils/getEnvironmentVariable";
import pg from "pg";
import { Sequelize } from "sequelize";

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
    getEnvironmentVariable("DB_NAME"),
    getEnvironmentVariable("DB_USER"),
    getEnvironmentVariable("DB_PASSWORD"),
    {
        host: getEnvironmentVariable("DB_HOST"),
        port: Number(getEnvironmentVariable("DB_PORT", "5432")), // use normal postgres default
        dialect: "postgres",
        dialectModule: pg,
        logging: false,
        pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: isProduction
            ? {
                  ssl: {
                      require: true,
                      rejectUnauthorized: false, // AWS RDS needs this
                  },
                  application_name: "soundspire-app",
              }
            : {
                  application_name: "soundspire-app",
              },
    }
);

export default sequelize;
