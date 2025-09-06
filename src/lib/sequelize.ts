// import pg from "pg";
// import { Sequelize } from "sequelize";

// const sequelize = new Sequelize(
//   process.env.DB_NAME as string,
//   process.env.DB_USER as string,
//   process.env.DB_PASSWORD!,
//   {
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT) || 6543, // Default to transactional pooler port
//     dialect: "postgres",
//     dialectModule: pg,
//     logging: false,
//     pool: {
//       max: 20, // Increase for transactional pooler
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//       // Add these options for transactional pooler
//       application_name: 'soundspire-app',
//     },
//   },
// );

// export default sequelize;


import pg from "pg";
import { Sequelize } from "sequelize";

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432, // use normal postgres default
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
