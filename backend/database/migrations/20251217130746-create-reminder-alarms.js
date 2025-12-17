'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ReminderAlarms', {
      reminder_alarm_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reminder_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Reminders',
          key: 'reminder_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      next_trigger_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_triggered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      trigger_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('ReminderAlarms', ['user_id'], {
      name: 'idx_reminder_alarms_user_id',
    });

    await queryInterface.addIndex('ReminderAlarms', ['reminder_id'], {
      name: 'idx_reminder_alarms_reminder_id',
    });

    await queryInterface.addIndex('ReminderAlarms', ['is_active'], {
      name: 'idx_reminder_alarms_is_active',
    });

    await queryInterface.addIndex('ReminderAlarms', ['next_trigger_at'], {
      name: 'idx_reminder_alarms_next_trigger_at',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ReminderAlarms');
  }
};

