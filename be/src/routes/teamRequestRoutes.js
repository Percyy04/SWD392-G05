const express = require('express');
const router = express.Router();
const teamModel = require('../models/teamModel');
const { verifyToken } = require('../middlewares/authMiddleware');
const db = require('../config/db'); // nhớ import nếu bạn có file db.js kết nối MySQL


// ------------------ Middleware kiểm tra leader ------------------
async function verifyLeader(req, res, next) {
  try {
    const userId = req.user?.id;
    const { teamId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Lấy thông tin team từ DB
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Kiểm tra leader
    if (team.LeaderID !== userId) {
      return res.status(403).json({ message: 'Access denied. Leader only.' });
    }

    next();
  } catch (err) {
    console.error('❌ verifyLeader error:', err);
    res.status(500).json({ message: err.message });
  }
}


// 🧩 Lấy danh sách giảng viên khả dụng
// 🧩 Lấy danh sách giảng viên (cho leader xem)
router.get('/lecturers', verifyToken, async (req, res) => {
  try {
    // chỉ lấy 3 trường cần thiết
    const [rows] = await db.query(`
      SELECT MaGV, HoTen, Email, PhongBan 
      FROM Lecture 
      WHERE Role = 'Lecturer'
    `);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('❌ Error fetching lecturers:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách giảng viên',
    });
  }
});



// ------------------ Request lecturer ------------------

// ✅ Leader gửi request đến lecturer
router.post('/:teamId/request/:lecturerId', verifyToken, verifyLeader, async (req, res) => {
  try {
    const { teamId, lecturerId } = req.params;
    const leaderId = req.user.id;

    const result = await teamModel.sendRequestToLecturer(teamId, leaderId, lecturerId);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error sending lecturer request:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
