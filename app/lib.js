const { Task, TaskHistory } = require('../models');
const { Op, Sequelize } = require('sequelize');

class TaskManager {
  // Записываем задачи в REDIS
  async enqueueTasks(taskQueue) {
    const tasks = await Task.findAll({ where: { is_active: true } });
    for (const task of tasks) {
      const taskHistory = await TaskHistory.findOne({
        where: {
          task_id: task.id,
        },
        order: [['finishedAt', 'DESC']],
      });
      if (taskHistory) {
        const finishedTime = taskHistory.finishedAt;
        const now = new Date();
        finishedTime.setMinutes(finishedTime.getMinutes() + task.interval);
        if (finishedTime > now) continue;
      }
      const jobs = await taskQueue.getJobs();
      const matchingJobs = jobs.filter((job) => job.data.id === task.id);
      if (matchingJobs.length === 0) {
        taskQueue.add(task);
      }
    }
  }

  // Получить очередь задач
  async getTasksQueue(taskQueue) {
    const inProgressJobs = await taskQueue.getJobs(['active']);
    const queue = inProgressJobs.map((job) => {
      const timePassed = Math.round(Number(new Date() - new Date(job.data.startDate)) / 1000);
      return {
        taskName: job.data.name,
        server: job.data.server,
        timePassed: `Прошло ${timePassed} сек.`,
      };
    });
    const taskCounts = {};
    queue.forEach((task) => {
      if (task.server in taskCounts) {
        taskCounts[task.server]++;
      } else {
        if (task.server !== undefined) taskCounts[task.server] = 1;
      }
    });

    return { taskCounts, queue };
  }

  // сравнить количество задач запущенном на разных серверах
  compareTaskQuantity(tasks, serverName) {
    if (Object.keys(tasks.taskCounts).length === 0) return true;
    const currentServerTasksCount = tasks.taskCounts[serverName] || 0;
    const minTaskCount = Math.min(...Object.values(tasks.taskCounts));
    if (currentServerTasksCount <= minTaskCount) return true;
    return false;
  }

  // метод, который вызывается в задаче
  async makeThatTask(task, serverName) {
    console.log(`${task.name} взята в работу на ${serverName}`);
    await delay(20 * 1000); // какая-то задача
    console.log(`${task.name} окончена на ${serverName}`);
  }

  // Задача готова
  async releaseTask(task, startDate, serverName) {
    await this.checkIfTaskTakeTwoMinutes(startDate, task.id);
    await TaskHistory.create({
      task_id: task.id,
      server: serverName,
      startedAt: new Date(startDate),
      finishedAt: new Date(),
    });
  }

  // Проверить прошло ли две минуты с начала выполнения задачи
  async checkIfTaskTakeTwoMinutes(parsedStartDate, taskId) {
    const twoMinutesLater = new Date(parsedStartDate);
    const now = new Date();
    twoMinutesLater.setMinutes(twoMinutesLater.getMinutes() + 2);
    if (now < twoMinutesLater) {
      const timeToWait = twoMinutesLater - now;
      console.log(`Ожидание до двух минут, осталось: ${Math.round(timeToWait / 1000)} сек.`);
      await delay(timeToWait);
      console.log(`Ожидание для ${taskId} окончено`);
    }
  }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = TaskManager;
