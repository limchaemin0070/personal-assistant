// src/migrations/20241126000002-create-schedules.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Schedules",
      {
        schedule_id: {
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
        memo: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        start_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        start_time: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        end_time: {
          type: Sequelize.TIME,
          allowNull: true,
        },
        is_all_day: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
      ALTER TABLE Schedules 
      ADD CONSTRAINT Schedules_chk_end_date CHECK (end_date >= start_date),
      ADD CONSTRAINT Schedules_chk_all_day CHECK (
        is_all_day = TRUE OR (start_time IS NOT NULL AND end_time IS NOT NULL)
      ),
      ADD CONSTRAINT Schedules_chk_time_order CHECK (
        start_time IS NULL OR end_time IS NULL OR end_time > start_time
      ),
      ADD CONSTRAINT Schedules_chk_title_length CHECK (CHAR_LENGTH(title) >= 1),
      ADD CONSTRAINT Schedules_chk_memo_length CHECK (CHAR_LENGTH(memo) <= 500)
    `);

    await queryInterface.addIndex("Schedules", ["user_id"], {
      name: "idx_schedules_user_id",
    });
    await queryInterface.addIndex("Schedules", ["start_date"], {
      name: "idx_schedules_start_date",
    });
    await queryInterface.addIndex("Schedules", ["end_date"], {
      name: "idx_schedules_end_date",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Schedules");
  },
};
