// src/models/studentModel.js
const db = require('../config/db');

const StudentModel = {
  // 🔍 Tìm sinh viên theo email
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM Student WHERE Email = ? LIMIT 1', [email]);
    return rows[0];
  },

  // 🔍 Tìm sinh viên theo mã số sinh viên
  async findById(maSV) {
    const [rows] = await db.query('SELECT * FROM Student WHERE MaSV = ? LIMIT 1', [maSV]);
    return rows[0];
  },

  // 🧩 Tạo mới sinh viên
  async create({ maSV, email, password, full_name }) {
    const [result] = await db.query(
      'INSERT INTO Student (MaSV, Email, MatKhau, HoTen) VALUES (?, ?, ?, ?)',
      [maSV, email, password, full_name]
    );
    return { id: result.insertId, maSV, email, full_name };
  },

  // 📋 Lấy danh sách sinh viên
  async getAll() {
    const [rows] = await db.query(
      'SELECT MaSV AS maSV, Email AS email, HoTen AS full_name FROM Student'
    );
    return rows;
  },

  // 🔑 Lưu reset code và thời gian hết hạn
  async updateResetCode(maSV, resetCode, resetExpires) {
    const sql = `
      UPDATE Student 
      SET resetPasswordCode = ?, resetPasswordExpires = ? 
      WHERE MaSV = ?
    `;
    await db.query(sql, [resetCode, resetExpires, maSV]);
  },

  // ❌ Xoá reset code và thời gian hết hạn
  async clearResetCode(maSV) {
    const sql = `
      UPDATE Student 
      SET resetPasswordCode = NULL, resetPasswordExpires = NULL 
      WHERE MaSV = ?
    `;
    await db.query(sql, [maSV]);
  },

  // 🔒 Cập nhật mật khẩu
  async updatePassword(maSV, hashedPassword) {
    const sql = `
      UPDATE Student 
      SET MatKhau = ? 
      WHERE MaSV = ?
    `;
    await db.query(sql, [hashedPassword, maSV]);
  }
};

module.exports = StudentModel;
