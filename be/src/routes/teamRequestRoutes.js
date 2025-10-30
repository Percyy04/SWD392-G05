const express = require('express');
const router = express.Router();
const teamModel = require('../models/teamModel');
const { verifyToken } = require('../middlewares/authMiddleware');

// Middleware kiểm tra leader (giả sử lưu userId trong req.user.id)
function verifyLeader(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

// ------------------ Request lecturer ------------------

// POST send request to lecturer (leader only)
router.post('/:teamId/request/:lecturerId', verifyToken, verifyLeader, async (req, res) => {
  try {
    const result = await teamModel.sendRequestToLecturer(
      req.params.teamId,
      req.user.id,         // ID leader lấy từ token
      req.params.lecturerId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
