// authMiddleware.js
const jwt = require("jsonwebtoken");
const teamModel = require("../models/teamModel");

// =====================================================
// ✅ Xác thực token JWT
// =====================================================
exports.verifyToken = (req, res, next) => {
  console.log("🔹 Authorization Header:", req.headers.authorization);
  const header = req.headers["authorization"];

  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Token format invalid" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// =====================================================
// ✅ Middleware kiểm tra Admin
// =====================================================
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// =====================================================
// ✅ Middleware kiểm tra Lecturer
// =====================================================
exports.verifyLecturer = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "Lecturer")
    return res
      .status(403)
      .json({ message: "Access denied. Lecturer only." });
  next();
};

// =====================================================
// ✅ Middleware kiểm tra Leader của Team
// =====================================================
exports.verifyLeader = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!teamId) {
      return res.status(400).json({ message: "Missing teamId parameter" });
    }

    // 🔍 Tìm team theo ID
    const team = await teamModel.findById(teamId);


    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ⚠️ Kiểm tra xem user hiện tại có phải là Leader của team không
    if (team.LeaderID !== userId) {
      return res
        .status(403)
        .json({ message: "Chỉ trưởng nhóm mới được gửi yêu cầu!" });
    }

    next();
  } catch (err) {
    console.error("❌ verifyLeader error:", err);
    res.status(500).json({ message: err.message });
  }
};
