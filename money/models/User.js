// models/User.js
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true }
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    twoFAEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    twoFACode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Users',
    timestamps: true,
    hooks: {
      // automatically hash plain‐text password → passwordHash
      beforeCreate: async (user) => {
        if (user.password) {
          user.passwordHash = await bcrypt.hash(user.password, 10);
          delete user.password;
        }
      },
      beforeUpdate: async (user) => {
        if (user.password) {
          user.passwordHash = await bcrypt.hash(user.password, 10);
          delete user.password;
        }
      }
    }
  });

  // instance method to verify password
  User.prototype.verifyPassword = function(plain) {
    return bcrypt.compare(plain, this.passwordHash);
  };

  return User;
};
