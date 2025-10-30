// models/adminModel.js
const db = require('../config/db'); // file kết nối MySQL (mysql2/promise)
const bcrypt = require('bcrypt');

// 🧑‍🏫 Tạo lecturer mới
async function createLecturer({ maGV, hoTen, email, matKhau }) {
  try {
    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // Kiểm tra email đã tồn tại
    const [exists] = await db.execute('SELECT * FROM Lecture WHERE Email = ?', [email]);
    if (exists.length > 0) {
      throw new Error('Email already exists');
    }

    // Thêm vào bảng Lecture
    await db.execute(
      'INSERT INTO Lecture (MaGV, HoTen, Email, MatKhau, Role, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [maGV, hoTen, email, hashedPassword, 'Lecturer']
    );

    return { maGV, hoTen, email, role: 'Lecturer' };
  } catch (err) {
    throw err;
  }
}

// 📋 Lấy tất cả lecturer
async function getAllLecturers() {
  try {
    const [rows] = await db.execute(
      'SELECT MaGV, HoTen, Email, Role, CreatedAt, UpdatedAt FROM Lecture WHERE Role = "Lecturer"'
    );
    return rows;
  } catch (err) {
    throw err;
  }
}

// ❌ Xoá lecturer
async function deleteLecturer(maGV) {
  try {
    const [check] = await db.execute('SELECT * FROM Lecture WHERE MaGV = ? AND Role = "Lecturer"', [maGV]);
    if (check.length === 0) throw new Error('Lecturer not found');

    const [result] = await db.execute('DELETE FROM Lecture WHERE MaGV = ?', [maGV]);
    return result.affectedRows; // trả về số dòng bị xoá
  } catch (err) {
    throw err;
  }
}

// ✏️ Cập nhật lecturer
async function updateLecturer(maGV, { hoTen, email, matKhau }) {
  try {
    const [check] = await db.execute('SELECT * FROM Lecture WHERE MaGV = ? AND Role = "Lecturer"', [maGV]);
    if (check.length === 0) throw new Error('Lecturer not found');

    const updates = [];
    const values = [];

    if (hoTen) {
      updates.push('HoTen = ?');
      values.push(hoTen);
    }

    if (email) {
      // Kiểm tra email trùng
      const [emailCheck] = await db.execute('SELECT * FROM Lecture WHERE Email = ? AND MaGV != ?', [email, maGV]);
      if (emailCheck.length > 0) throw new Error('Email already exists');
      updates.push('Email = ?');
      values.push(email);
    }

    if (matKhau) {
      const hashedPassword = await bcrypt.hash(matKhau, 10);
      updates.push('MatKhau = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) throw new Error('No fields to update');

    // Thêm UpdatedAt
    updates.push('UpdatedAt = NOW()');

    const sql = `UPDATE Lecture SET ${updates.join(', ')} WHERE MaGV = ?`;
    values.push(maGV);

    const [result] = await db.execute(sql, values);
    return result.affectedRows;
  } catch (err) {
    throw err;
  }
}

async function findLecturerByEmail(email) {
  const [rows] = await db.execute('SELECT * FROM Lecture WHERE Email = ?', [email]);
  return rows[0] || null;
}

// Lưu mã reset
async function updateResetCode(maGV, code, expires) {
  try {
    await db.execute(
      'UPDATE Lecture SET resetPasswordCode = ?, resetPasswordExpires = ? WHERE MaGV = ?',
      [code, expires, maGV]
    );
  } catch (err) {
    throw err;
  }
}

// Lấy lecturer theo id
async function findLecturerById(maGV) {
  const [rows] = await db.execute('SELECT * FROM Lecture WHERE MaGV = ?', [maGV]);
  return rows[0] || null;
}

// Cập nhật mật khẩu mới
async function updatePassword(maGV, hashedPassword) {
  try {
    await db.execute(
      'UPDATE Lecture SET MatKhau = ?, UpdatedAt = NOW() WHERE MaGV = ?',
      [hashedPassword, maGV]
    );
  } catch (err) {
    throw err;
  }
}

// Xoá reset code sau khi đổi mật khẩu thành công
async function clearResetCode(maGV) {
  try {
    await db.execute(
      'UPDATE Lecture SET resetPasswordCode = NULL, resetPasswordExpires = NULL WHERE MaGV = ?',
      [maGV]
    );
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createLecturer,
  getAllLecturers,
  deleteLecturer,
  updateLecturer,
  findLecturerByEmail,
  findLecturerById,
  updateResetCode,
  updatePassword,
  clearResetCode,
};