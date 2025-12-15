// src/migrations/20241126000004-create-alarms.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Alarms",
      {
        alarm_id: {
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
        schedule_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Schedules",
            key: "schedule_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        reminder_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Reminders",
            key: "reminder_id",
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
          allowNull: false,
        },
        is_repeat: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        repeat_days: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        alarm_type: {
          type: Sequelize.ENUM("basic", "event"),
          allowNull: false,
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
      ALTER TABLE Alarms 
      ADD CONSTRAINT Alarms_chk_repeat CHECK (
        is_repeat = FALSE OR repeat_days IS NOT NULL
      ),
      ADD CONSTRAINT Alarms_chk_title_length CHECK (CHAR_LENGTH(title) >= 1)
    `);
    // 주의: Alarms_chk_alarm_type 제약 조건은 MySQL 8.0.16+에서 외래 키로 참조되는 컬럼을 
    // CHECK 제약 조건에서 사용할 수 없어 제거되었습니다. 
    // 대신 애플리케이션 레벨(alarmValidator.ts)에서 검증합니다.

    await queryInterface.addIndex("Alarms", ["user_id"], {
      name: "idx_alarms_user_id",
    });
    await queryInterface.addIndex("Alarms", ["schedule_id"], {
      name: "idx_alarms_schedule_id",
    });
    await queryInterface.addIndex("Alarms", ["reminder_id"], {
      name: "idx_alarms_reminder_id",
    });
    await queryInterface.addIndex("Alarms", ["is_active"], {
      name: "idx_alarms_is_active",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Alarms");
  },
};
