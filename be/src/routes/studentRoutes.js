const express = require('express');
const router = express.Router();
const studentModel = require('../models/studentModel');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Student]
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const students = await studentModel.getAll();
    return res.json({ success: true, students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
