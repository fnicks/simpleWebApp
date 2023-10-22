const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('../models');
const TaskManager = require('./lib');
const Queue = require('bull');
require('dotenv').config();
const taskQueue = new Queue('taskQueue', process.env.REDIS_URL);
const app = express();
const port = process.env.PORT || 5000;
const serverName = `${port}SRV`;

app.use(bodyParser.json());

const taskManager = new TaskManager();

if (port === 5000) {
  const schedule = require('node-schedule');
  const scheduleTime = '*/1 * * * * *';
  console.log('Менеджер задач запущен');
  schedule.scheduleJob('task', scheduleTime, async () => {
    await taskManager.enqueueTasks(taskQueue);
  });
}

// Роут для обновления баланса пользователя
app.post('/update-balance', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Неправильные параметры' });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const newBalance = user.balance + parseInt(amount);

  if (newBalance < 0) {
    return res.status(400).json({ error: 'Баланс не может быть отрицательным' });
  }

  user.balance = newBalance;
  await user.save();

  return res.json({ message: 'Баланс успешно обновлен' });
});

// Роут получения списка фоновых задач
app.get('/tasks', async (req, res) => {
  const queue = await taskManager.getTasksQueue(taskQueue);
  return res.json(queue);
});

app.listen(port, () => {
  console.log(`Сервер ${serverName} запущен на порту ${port}`);
});

taskQueue.process(50, async function (task, jobDone) {
  if (!taskManager.compareTaskQuantity(await taskManager.getTasksQueue(taskQueue), serverName)) return;
  const startDate = new Date().toISOString();
  task.data.server = serverName;
  task.data.startDate = startDate;
  await task.update(task.data);
  console.log(`Processing task: ${task.data.id}`);
  const newTask = task.data;
  await taskManager[newTask.method](newTask, serverName);
  await taskManager.releaseTask(newTask, startDate, serverName);
  jobDone();
});
