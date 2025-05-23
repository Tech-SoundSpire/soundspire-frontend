import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db";

export const User =  sequelize.define(
  'User', {

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Provide name"
        },
        notEmpty: {
          msg: " name cannot be empty"
        }
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Provide user name"
        },
        notEmpty: {
          msg: "User name cannot be empty"
        }
      },
      unique: true
    },
    gender: {
      type: DataTypes.ENUM("male","female"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Enter your gender"
        },
      },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_no: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
       is: {
        args: /^[0-9]{10}$/,
        msg: "Provide a valid 10-digit mobile number"
       }
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Enter a valid email"
        },
        notNull: {
          msg: "Email is required"
        }
      },
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Provide a valid password"
        },
      },
    },
    isVerified: { //If user is verified or not
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAdmin: { //If user is admin or not
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    forgotPasswordToken: {
      type: DataTypes.STRING,
    },
    forgotPasswordTokenExpiry: {
      type: DataTypes.DATE,
    },
    verifyToken: {
      type: DataTypes.STRING,
    },
    verifyTokenExpiry: {
      type: DataTypes.DATE,
    },
    

  }
)
