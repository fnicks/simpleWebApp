'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaskHistory extends Model {
    static associate(models) {
      TaskHistory.belongsTo(models.Task, {
        foreignKey: 'task_id',
        as: 'Task',
      });
    }
  }
  TaskHistory.init({
    task_id: DataTypes.INTEGER,
    server: DataTypes.STRING,
    startedAt: DataTypes.DATE,
    finishedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'TaskHistory',
  });
  return TaskHistory;
};