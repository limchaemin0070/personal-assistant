// src/migrations/20241126000003-create-reminders.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Reminders",
      {
        reminder_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "user_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        time: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        memo: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        is_all_day: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        is_completed: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true,
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
      ALTER TABLE Reminders 
      ADD CONSTRAINT Reminders_chk_all_day CHECK (
        is_all_day = TRUE OR time IS NOT NULL
      ),
      ADD CONSTRAINT Reminders_chk_notification CHECK (
        notification_enabled = FALSE OR date IS NOT NULL
      ),
      ADD CONSTRAINT Reminders_chk_completed CHECK (
        (is_completed = FALSE AND completed_at IS NULL) OR 
        (is_completed = TRUE AND completed_at IS NOT NULL)
      ),
      ADD CONSTRAINT Reminders_chk_title_length CHECK (CHAR_LENGTH(title) >= 1),
      ADD CONSTRAINT Reminders_chk_memo_length CHECK (CHAR_LENGTH(memo) <= 500)
    `);

    await queryInterface.addIndex("Reminders", ["user_id"], {
      name: "idx_reminders_user_id",
    });
    await queryInterface.addIndex("Reminders", ["date"], {
      name: "idx_reminders_date",
    });
    await queryInterface.addIndex("Reminders", ["is_completed"], {
      name: "idx_reminders_is_completed",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reminders");
  },
};
