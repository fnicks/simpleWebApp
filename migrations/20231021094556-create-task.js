'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      interval: {
        type: Sequelize.INTEGER,
      },
      method: {
        type: Sequelize.STRING,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Создать 100 задач
    const tasks = Array(100)
      .fill(undefined)
      .map((_, index) => {
        return {
          method: 'makeThatTask',
          interval: randomIntFromInterval(2, 6), 
          name: `Задача ${index + 1}`,
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    await queryInterface.bulkInsert('Tasks', tasks);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tasks');
  },
};


function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}