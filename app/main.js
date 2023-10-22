const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const schedule = require('node-schedule');
const Queue = require('bull');
const TaskManager = require('./lib');
require('dotenv').config();
const taskQueue = new Queue('taskQueue', process.env.REDIS_URL);
const taskManager = new TaskManager();

if (cluster.isMaster) {
  const scheduleTime = '*/1 * * * * *';
  console.log('Менеджер задач запущен');
  schedule.scheduleJob('task', scheduleTime, async () => {
    await taskManager.enqueueTasks(taskQueue);
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ PORT: 3000 + i });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  require('./app.js');
}
