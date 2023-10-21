const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./models');

const app = express();
const port = 3000;

app.use(bodyParser.json());

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

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});