const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const studentModel = require('../models/studentModel');
const { generateToken } = require('../utils/token');


dotenv.config();

// Cấu hình Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: User registration endpoint
 *     tags: [Authentication]
 */
router.post('/register', async (req, res) => {
  console.log("Register body:", req.body);  
  const { maSV, email, password, full_name } = req.body;

  if (!maSV || !email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message: 'maSV, email, password, and full_name are required',
    });
  }

  try {
    // 🔍 Kiểm tra trùng email hoặc mã SV
    const existingUser = await studentModel.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already exists' });

    const existingMaSV = await studentModel.findById(maSV);
    if (existingMaSV)
      return res.status(400).json({ success: false, message: 'Student ID already exists' });

    // 🔒 Mã hoá mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // 💾 Tạo sinh viên mới
    const student = await studentModel.create({ maSV, email, password: hashed, full_name });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      student,
    });
  } catch (err) {
    console.error('Register error:', err);

    // ✅ Trả về chi tiết lỗi nếu MySQL error
    const errorMsg = err.sqlMessage || err.message || 'Server error';
    return res.status(500).json({ success: false, message: errorMsg });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login endpoint
 *     tags: [Authentication]
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  try {
    const user = await studentModel.findByEmail(email);
    if (!user)
      return res.status(401).json({ success: false, message: 'Email not found' });

    const valid = await bcrypt.compare(password, user.MatKhau);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Incorrect password' });

    const token = generateToken({ id: user.MaSV, email: user.Email });
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { maSV: user.MaSV, email: user.Email, full_name: user.HoTen },
    });
  } catch (err) {
    console.error('Login error:', err);
    const errorMsg = err.sqlMessage || err.message || 'Server error';
    return res.status(500).json({ success: false, message: errorMsg });
  }
});


/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Request password reset code
 *     tags: [Authentication]
 */
router.post('/forgot-password', async (req, res) => {
  console.log('POST /forgot-password called');
  console.log('Body:', req.body);
  const { email } = req.body;

  try {
    const user = await studentModel.findByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });

    // tạo mã reset 5 số
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    const resetExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    // Lưu vào studentModel
    await studentModel.updateResetCode(user.MaSV, resetCode, resetExpires);

    // Nội dung email
    const emailContent = `
      <p>Xin chào ${user.HoTen},</p>
      <p>Mã đặt lại mật khẩu của bạn là: <b>${resetCode}</b></p>
      <p>Mã sẽ hết hạn sau 10 phút.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.Email,
      subject: 'Mã đặt lại mật khẩu của bạn',
      html: emailContent
    });

    res.json({ success: true, message: 'Mã đặt lại mật khẩu đã được gửi đến email.' });
  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/**
 * @swagger
 * /api/verify-reset-code:
 *   post:
 *     summary: Verify reset code and get temporary token
 *     tags: [Authentication]
 */
router.post('/verify-reset-code', async (req, res) => {
  const { email, resetCode } = req.body;

  try {
    const user = await studentModel.findByEmail(email);
    if (
      !user ||
      user.resetPasswordCode !== resetCode ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ success: false, message: 'Mã xác minh không hợp lệ hoặc đã hết hạn.' });
    }

    // Tạo JWT tạm thời 10 phút
    const resetToken = jwt.sign(
      { userId: user.MaSV },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ success: true, message: 'Mã xác minh thành công', resetToken });
  } catch (err) {
    console.error('Verify-reset-code error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password using temporary token
 *     tags: [Authentication]
 */
router.post('/reset-password', async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const resetToken = req.header('Authorization');

  if (!resetToken) return res.status(401).json({ success: false, message: 'Token không tồn tại.' });

  if (!newPassword || !confirmPassword)
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu mới và xác nhận.' });

  if (newPassword.length < 5)
    return res.status(400).json({ success: false, message: 'Mật khẩu phải ít nhất 5 ký tự.' });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ success: false, message: 'Mật khẩu mới và xác nhận không khớp.' });

  try {
    const actualToken = resetToken.startsWith('Bearer ') ? resetToken.slice(7) : resetToken;
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    const user = await studentModel.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Người dùng không tìm thấy.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await studentModel.updatePassword(user.MaSV, hashed);

    // Xoá reset code
    await studentModel.clearResetCode(user.MaSV);

    res.json({ success: true, message: 'Mật khẩu đã được đặt lại thành công.' });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn.' });
    }
    console.error('Reset-password error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});


module.exports = router;
