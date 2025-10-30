// lecturerRequestRoutes.js
const express = require('express');
const router = express.Router();
const teamModel = require('../models/teamModel');
const { verifyToken, verifyLecturer } = require('../middlewares/authMiddleware');

// GET tất cả request dành cho lecturer
router.get('/requests', verifyToken, verifyLecturer, async (req, res) => {
  const requests = await teamModel.getRequestsForLecturer(req.user.id);
  res.json({ success: true, data: requests });
});

// PATCH phản hồi request
router.patch('/requests/:requestId/respond', verifyToken, verifyLecturer, async (req, res) => {
  const { action } = req.body;
  const result = await teamModel.respondRequest(req.params.requestId, req.user.id, action);
  res.json({ success: true, data: result });
});

module.exports = router; // <--- phải có dòng này
