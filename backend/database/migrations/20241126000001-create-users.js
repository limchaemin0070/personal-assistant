// src/migrations/20241126000001-create-users.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Users",
      {
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        nickname: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        notification_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      },
      {
        engine: "InnoDB",
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
      }
    );

    await queryInterface.sequelize.query(`
      ALTER TABLE Users 
      ADD CONSTRAINT Users_chk_email_length CHECK (CHAR_LENGTH(email) <= 50),
      ADD CONSTRAINT Users_chk_nickname_length CHECK (CHAR_LENGTH(nickname) <= 10),
      ADD CONSTRAINT Users_chk_email_format CHECK (email LIKE '%@%.%')
    `);

    await queryInterface.addIndex("Users", ["email"], {
      name: "idx_users_email",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
