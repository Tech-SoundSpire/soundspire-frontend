// import { DataTypes } from "sequelize";
// import { sequelize } from "../lib/dbConfig";

// export const User = sequelize.define("User", {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       notNull: {
//         msg: "Provide name",
//       },
//       notEmpty: {
//         msg: " name cannot be empty",
//       },
//     },
//   },
//   username: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       notNull: {
//         msg: "Provide user name",
//       },
//       notEmpty: {
//         msg: "User name cannot be empty",
//       },
//     },
//     unique: true,
//   },
//   gender: {
//     type: DataTypes.ENUM("male", "female"),
//     allowNull: false,
//     validate: {
//       notNull: {
//         msg: "Enter your gender",
//       },
//     },
//   },
//   dateOfBirth: {
//     type: DataTypes.DATEONLY,
//     allowNull: false,
//   },
//   city: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   mobile_no: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       is: {
//         args: /^[0-9]{10}$/,
//         msg: "Provide a valid 10-digit mobile number",
//       },
//     },
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       isEmail: {
//         msg: "Enter a valid email",
//       },
//       notNull: {
//         msg: "Email is required",
//       },
//     },
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       notNull: {
//         msg: "Provide a valid password",
//       },
//     },
//   },
//   isVerified: {
//     //If user is verified or not
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   isAdmin: {
//     //If user is admin or not
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   forgotPasswordToken: {
//     type: DataTypes.STRING,
//   },
//   forgotPasswordTokenExpiry: {
//     type: DataTypes.DATE,
//   },
//   verifyToken: {
//     type: DataTypes.STRING,
//   },
//   verifyTokenExpiry: {
//     type: DataTypes.DATE,
//   },
// });


import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import {v4 as uuidv4} from 'uuid';

export const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Provide user name" },
        notEmpty: { msg: "User name cannot be empty" },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Email is required" },
        isEmail: { msg: "Enter a valid email" },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Provide a valid password" },
      },
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Provide name" },
        notEmpty: { msg: "Name cannot be empty" },
      },
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
      validate: {
        notNull: { msg: "Enter your gender" },
      },
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      // allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      // allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
     // allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: {
          args: /^[0-9]{10}$/,
          msg: "Provide a valid 10-digit mobile number",
        },
      },
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
     // allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
    //  allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_artist: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    google_id: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
    },
    spotify_linked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    forgotPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forgotPasswordTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verifyToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verifyTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    paranoid: true,
    indexes: [
      {
        name: "idx_users_email",
        fields: ["email"],
      },
      {
        name: "idx_users_username",
        fields: ["username"],
      },
    ],
  }
);

