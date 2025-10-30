// src/routes/lecturerRequestRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const teamModel = require("../models/teamModel");
const { verifyToken, verifyLecturer } = require("../middlewares/authMiddleware");

// ---------------------------
// 🧩 1️⃣ Lấy danh sách giảng viên (Leader xem để chọn gửi request)
// ---------------------------
router.get("/lecturers", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT MaGV, HoTen, Email
      FROM Lecture
      WHERE Role = 'Lecturer'
    `);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("❌ Error fetching lecturers:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách giảng viên",
    });
  }
});

// ---------------------------
// 🧩 2️⃣ Leader gửi request tới giảng viên
// ---------------------------
router.post("/:teamId/request/:lecturerId", verifyToken, async (req, res) => {
  try {
    const { teamId, lecturerId } = req.params;
    const leaderId = req.user.id;

    // ✅ Kiểm tra team có tồn tại và đúng leader không
    const team = await teamModel.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhóm" });
    }

    if (team.LeaderID !== leaderId) {
      return res.status(403).json({ success: false, message: "Chỉ leader mới được gửi yêu cầu" });
    }

    // ✅ Kiểm tra team đã có giảng viên đồng ý chưa
    const approvedLecturer = await teamModel.getApprovedLecturer(teamId);
    if (approvedLecturer) {
      return res.status(400).json({
        success: false,
        message: `Team này đã có giảng viên đồng ý: ${approvedLecturer.HoTen}`,
        data: approvedLecturer,
      });
    }

    // ✅ Kiểm tra nếu đã gửi request trước và đang chờ phản hồi
    const pendingRequest = await teamModel.getPendingRequest(teamId);
    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: `Team này đang chờ phản hồi từ giảng viên: ${pendingRequest.HoTen}`,
        data: pendingRequest,
      });
    }

    // ✅ Gửi request
    const result = await teamModel.sendRequestToLecturer(teamId, leaderId, lecturerId);

    res.status(200).json({
      success: true,
      message: "Đã gửi yêu cầu đến giảng viên",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error sending lecturer request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ---------------------------
// 🧩 3️⃣ Lecturer xem tất cả request gửi đến mình
// ---------------------------
router.get("/requests", verifyToken, verifyLecturer, async (req, res) => {
  try {
    console.log("req.user:", req.user); // ✅ in ra xem có id không
    const requests = await teamModel.getRequestsForLecturer(req.user.id);
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    console.error("❌ Error fetching requests:", err); // xem chi tiết lỗi
    res.status(500).json({ success: false, message: err.message });
  }
});


// ---------------------------
// 🧩 4️⃣ Lecturer phản hồi request (accept/reject)
// ---------------------------
router.patch("/requests/:requestId/respond", verifyToken, verifyLecturer, async (req, res) => {
  try {
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("Lecturer id:", req.user.id);

    const { action } = req.body;
    const result = await teamModel.respondRequest(req.params.requestId, req.user.id, action);

    console.log("Respond result:", result);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Error responding request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router;
