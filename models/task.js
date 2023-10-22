'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.hasMany(models.TaskHistory, {
        foreignKey: 'task_id',
        as: 'TaskHistory',
      });
    }
  }
  Task.init(
    {
      name: DataTypes.STRING,
      interval: DataTypes.INTEGER,
      method: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Task',
    }
  );
  return Task;
};
