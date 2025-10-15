const express = require('express');
const router = express.Router();

// 模拟作业数据
const homeworks = [];

router.get('/', (req, res) => {
  res.json({ success: true, data: homeworks });
});

router.post('/', (req, res) => {
  const homework = { id: String(homeworks.length + 1), ...req.body };
  homeworks.push(homework);
  res.status(201).json({ success: true, data: homework });
});

module.exports = router;

