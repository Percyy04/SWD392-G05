const express = require('express');
const router = express.Router();
const studentModel = require('../models/studentModel');
const teamModel = require('../models/teamModel');
const db = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

/**
 * GET /api/students/me
 * Lấy thông tin sinh viên hiện tại (Student role)
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id; // thay vì req.user.maSV
    const student = await studentModel.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/students
 * Lấy tất cả sinh viên (Admin only)
 */
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const students = await studentModel.getAll();
    return res.json({ success: true, students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/students/teams
 * Lấy tất cả nhóm có sẵn
 * Nếu student chưa có team, frontend sẽ hiển thị nút join/create
 */
router.get('/teams', verifyToken, async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT 
        t.MaTeam AS teamId,
        t.TenTeam AS name,
        t.TrangThaiNhom AS status,
        t.MoTaNhom AS description,
        (
          SELECT COUNT(*) 
          FROM Student s 
          WHERE s.Team = t.MaTeam
        ) AS membersCount,
        t.SoLuongThanhVienToiDa AS maxMembers,
        t.LeaderID AS leaderId,
        t.LeaderName AS leaderName
      FROM Team t
    `);

    return res.json({ success: true, teams });
  } catch (err) {
    console.error("Error fetching teams:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// /**
//  * GET /api/students/requests
//  * Lấy các request tham gia nhóm của sinh viên hiện tại
//  */
router.get('/requests', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const [requests] = await db.query(
      `SELECT tr.id, tr.teamId, t.TenTeam AS teamName, tr.status, tr.requested_at
       FROM team_requests tr
       JOIN Team t ON tr.teamId = t.MaTeam
       WHERE tr.studentId = ?`,
      [studentId]
    );
    return res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});



router.post('/join-team/:teamId', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teamId } = req.params;

    // Lấy thông tin student
    const student = await studentModel.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (student.Team) {
      return res.status(400).json({ success: false, message: 'You are already in a team' });
    }

    // Lấy thông tin team
    const team = await teamModel.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    // Kiểm tra số lượng thành viên
    if (team.SoLuongThanhVienHienTai >= team.SoLuongThanhVienToiDa) {
      return res.status(400).json({ success: false, message: 'Team is full' });
    }

    // Cập nhật team cho student
    await studentModel.joinTeam(studentId, teamId);

    // Lấy lại team mới nhất
    const updatedTeam = await teamModel.findById(teamId);

    // Cập nhật trạng thái nếu đủ thành viên
    if (updatedTeam.SoLuongThanhVienHienTai >= updatedTeam.SoLuongThanhVienToiDa) {
      await teamModel.updateStatus(teamId, 'Voting');
      updatedTeam.TrangThaiNhom = 'Voting';
    }

    return res.json({ 
      success: true, 
      message: 'You have joined the team successfully', 
      team: updatedTeam 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/students/team/:teamId
 * Lấy chi tiết 1 team + danh sách thành viên
 */
router.get('/team/:teamId', verifyToken, async (req, res) => {
  try {
    const { teamId } = req.params;

    // Lấy thông tin team
    const [teamRows] = await db.query(
      `SELECT 
        t.MaTeam AS teamId,
        t.TenTeam AS name,
        t.TrangThaiNhom AS status,
        t.MoTaNhom AS description,
        t.SoLuongThanhVienToiDa AS maxMembers,
        t.LeaderID AS leaderId,
        t.LeaderName AS leaderName,
        (
          SELECT COUNT(*) FROM Student s WHERE s.Team = t.MaTeam
        ) AS currentMembers
      FROM Team t
      WHERE t.MaTeam = ?`,
      [teamId]
    );

    if (!teamRows.length)
      return res.status(404).json({ success: false, message: "Team not found" });

    const team = teamRows[0];

    // Lấy danh sách thành viên
    const [members] = await db.query(
      `SELECT 
        s.MaSV AS studentId,
        s.HoTen AS fullName,
        s.Email AS email,
        s.Role AS role
      FROM Student s
      WHERE s.Team = ?`,
      [teamId]
    );

    return res.json({
      success: true,
      team: {
        ...team,
        members
      }
    });
  } catch (err) {
    console.error("Error fetching team detail:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/students/leave-team/:teamId
router.post("/leave-team/:teamId", verifyToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const studentId = req.user.id; // Lấy từ token

    // 1️⃣ Kiểm tra sinh viên có trong team không
    const [studentRows] = await db.query(
      "SELECT Team FROM Student WHERE MaSV = ?",
      [studentId]
    );

    if (!studentRows.length)
      return res.status(404).json({ success: false, message: "Student not found" });

    if (studentRows[0].Team !== teamId)
      return res.status(400).json({ success: false, message: "You are not in this team" });

    // 2️⃣ Kiểm tra nếu sinh viên là leader
    const [teamRows] = await db.query(
      "SELECT LeaderID, SoLuongThanhVienToiDa FROM Team WHERE MaTeam = ?",
      [teamId]
    );

    if (!teamRows.length)
      return res.status(404).json({ success: false, message: "Team not found" });

    const team = teamRows[0];

    // Nếu sinh viên là leader
    if (team.LeaderID === studentId) {
      // Kiểm tra còn thành viên khác không
      const [otherMembers] = await db.query(
        "SELECT MaSV FROM Student WHERE Team = ? AND MaSV != ?",
        [teamId, studentId]
      );

      if (otherMembers.length > 0) {
        // ✅ Gán leader mới là thành viên đầu tiên còn lại
        const newLeaderId = otherMembers[0].MaSV;

        // Lấy tên leader mới
        const [[newLeader]] = await db.query(
          "SELECT HoTen FROM Student WHERE MaSV = ?",
          [newLeaderId]
        );

        await db.query(
          "UPDATE Team SET LeaderID = ?, LeaderName = ? WHERE MaTeam = ?",
          [newLeaderId, newLeader.HoTen, teamId]
        );
      } else {
        // ❌ Nếu không còn ai -> xóa nhóm
        await db.query("DELETE FROM Team WHERE MaTeam = ?", [teamId]);
      }
    }

    // 3️⃣ Cập nhật Student để rời khỏi team
    await db.query("UPDATE Student SET Team = NULL WHERE MaSV = ?", [studentId]);

    return res.json({
      success: true,
      message: "You have left the team successfully",
    });
  } catch (err) {
    console.error("Error leaving team:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while leaving team",
    });
  }
});

/**
 * POST /api/students/create-team
 * Sinh viên tạo nhóm mới (chỉ khi chưa thuộc nhóm nào)
 */
router.post("/create-team", verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { name, description, maxMembers } = req.body;

    if (!name || !maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Team name and maximum members are required",
      });
    }

    // 1️⃣ Kiểm tra sinh viên đã có nhóm chưa
    const [[student]] = await db.query(
      "SELECT HoTen, Team FROM Student WHERE MaSV = ?",
      [studentId]
    );

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    if (student.Team)
      return res.status(400).json({ success: false, message: "You already belong to a team" });

    // 2️⃣ Tạo nhóm mới
    const [result] = await db.query(
      `INSERT INTO Team (TenTeam, MoTaNhom, TrangThaiNhom, SoLuongThanhVienToiDa, LeaderID, LeaderName)
       VALUES (?, ?, 'Pending', ?, ?, ?)`,
      [name, description || "", maxMembers, studentId, student.HoTen]
    );

    const newTeamId = result.insertId;

    // 3️⃣ Gán nhóm mới cho sinh viên
    await db.query("UPDATE Student SET Team = ? WHERE MaSV = ?", [newTeamId, studentId]);

    // 4️⃣ Lấy thông tin nhóm vừa tạo
    const [[newTeam]] = await db.query(
      `SELECT 
        MaTeam AS teamId,
        TenTeam AS name,
        MoTaNhom AS description,
        TrangThaiNhom AS status,
        SoLuongThanhVienToiDa AS maxMembers,
        LeaderID AS leaderId,
        LeaderName AS leaderName
       FROM Team
       WHERE MaTeam = ?`,
      [newTeamId]
    );

    return res.json({
      success: true,
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (err) {
    console.error("Error creating team:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating team",
    });
  }
});



module.exports = router;
