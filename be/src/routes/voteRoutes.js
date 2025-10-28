const express = require("express");
const router = express.Router();
const teamModel = require("../models/teamModel");
const db = require("../config/db");

// ✅ Middleware token
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/leader", verifyToken, async (req, res) => {
  try {
    const voterId = req.user.id; // đây chính là MaSV
    const { teamId, candidateId } = req.body;

    // ✅ Kiểm tra body hợp lệ
    if (!teamId || !candidateId) {
      return res.status(400).json({ status: "error", msg: "Missing team or candidate" });
    }

    // ✅ Không cho tự vote mình
    if (voterId === candidateId) {
      return res.status(400).json({ status: "error", msg: "You cannot vote for yourself" });
    }

    // ✅ Kiểm tra voter có thuộc team không
    const [[voter]] = await db.execute(
      "SELECT Team FROM Student WHERE MaSV = ?",
      [voterId]
    );

    if (!voter || voter.Team != teamId) {
      return res.status(403).json({ status: "error", msg: "You are not in this team" });
    }

    // ✅ Tiến hành vote
    const result = await teamModel.voteLeader(teamId, voterId, candidateId);

    // ✅ Phản hồi theo trạng thái model trả về
    if (result.status === "leader_chosen") {
      return res.json({
        status: "leader_chosen",
        msg: "Leader selected successfully!",
        data: result
      });
    }

    return res.json({
      status: "voted",
      msg: "Vote recorded successfully",
      data: result
    });

  } catch (err) {
    console.error("❌ Vote Leader Error:", err);
    return res.status(500).json({ status: "error", msg: "Vote failed" });
  }
});




// ✅ API: Student & Admin xem kết quả vote trong Team
router.get("/leader/:teamId", verifyToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // ✅ Nếu là Admin → xem được ngay
    if (requesterRole !== "Admin") {
      // ✅ Student phải thuộc đúng team
      const [[student]] = await db.execute(
        "SELECT Team FROM Student WHERE MaSV = ?",
        [requesterId]
      );

      if (!student) {
        return res.status(404).json({
          status: "error",
          msg: "Student not found"
        });
      }

      if (String(student.Team) !== String(teamId)) {
        return res.status(403).json({
          status: "error",
          msg: "You don't have access to view this team's votes"
        });
      }
    }

    // ✅ Lấy danh sách phiếu bầu
    const [rows] = await db.execute(`
      SELECT 
        v.teamId,
        v.voterId,
        sv.HoTen AS voterName,
        v.candidateId,
        sc.HoTen AS candidateName
      FROM TeamVotes v
      LEFT JOIN Student sv ON sv.MaSV = v.voterId
      LEFT JOIN Student sc ON sc.MaSV = v.candidateId
      WHERE v.teamId = ?
    `, [teamId]);

    return res.status(200).json({
      status: "success",
      teamId,
      totalVotes: rows.length,
      votes: rows
    });

  } catch (err) {
    console.error("❌ Get Votes Error:", err);
    return res.status(500).json({
      status: "error",
      msg: "Cannot get votes for this team",
      error: err.message
    });
  }
});



module.exports = router;
