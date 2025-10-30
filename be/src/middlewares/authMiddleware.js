// authMiddleware.js

const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  console.log("🔹 Authorization Header:", req.headers.authorization);
  const header = req.headers['authorization'];
  

  if (!header) return res.status(401).json({ message: 'No token provided' });

  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token format invalid' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", decoded); // <--- thêm dòng này
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};


// Middleware kiểm tra Admin
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware kiểm tra Lecturer
exports.verifyLecturer = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'Lecturer') return res.status(403).json({ message: 'Access denied. Lecturer only.' });
  next();
};

