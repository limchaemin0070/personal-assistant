// src/migrations/20241127000001-modify-alarms-title-optional.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. 기존 CHECK 제약조건 제거 (MySQL에서는 직접 제거)
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE Alarms 
        DROP CHECK Alarms_chk_title_length
      `);
    } catch (error) {
      // 제약조건이 없을 수 있으므로 에러 무시
      console.log("제약조건이 이미 없거나 제거할 수 없습니다:", error.message);
    }

    // 2. title 컬럼을 nullable로 변경
    await queryInterface.changeColumn("Alarms", "title", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // 롤백: title 컬럼을 다시 NOT NULL로 변경하고 제약조건 추가
    await queryInterface.changeColumn("Alarms", "title", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Alarms 
      ADD CONSTRAINT Alarms_chk_title_length CHECK (CHAR_LENGTH(title) >= 1)
    `);
  },
};

