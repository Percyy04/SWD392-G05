const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const db = require('./src/Database/db');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// Middleware
app.use(express.json());

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation with Swagger'
    }
  },
  apis: ['./index.js'], // Đường dẫn tới file mô tả API
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: User registration endpoint
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               full_name:
 *                 type: string
 *                 example: Nguyen Van A
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
app.post('/api/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password and full_name are required'
    });
  }

  try {
    // 1️⃣ Kiểm tra email đã tồn tại chưa
    const [checkUser] = await db.query(
      'SELECT * FROM Student WHERE Email = ? LIMIT 1',
      [email]
    );

    if (checkUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // 2️⃣ Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3️⃣ Lưu user vào DB
    const [result] = await db.query(
      'INSERT INTO Student (Email, MatKhau, HoTen) VALUES (?, ?, ?)',
      [email, hashedPassword, full_name]
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        email,
        full_name
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login endpoint
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    // 1️⃣ Truy vấn user theo email
    const [rows] = await db.query(
      'SELECT * FROM Student WHERE Email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email not found'
      });
    }

    const user = rows[0];

    // 2️⃣ So sánh mật khẩu gửi lên với mật khẩu đã hash trong DB
    const isMatch = await bcrypt.compare(password, user.MatKhau);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // 3️⃣ Nếu đúng → trả về token (mock hoặc JWT thật)
    return res.json({
      success: true,
      message: 'Login successful',
      token: 'real-jwt-token-here-or-generate',
      user: {
        id: user.MaSV,
        email: user.Email,
        full_name: user.HoTen
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   full_name:
 *                     type: string
 *                     example: Nguyen Van A
 */
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT MaSV as id, Email as email, HoTen as full_name FROM Student'
    );

    return res.json({
      success: true,
      students: rows
    });
  } catch (err) {
    console.error('Get students error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});
