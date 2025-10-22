// --------------------
// ✅ Load environment variables first
// --------------------
require('dotenv').config({ path: __dirname + '/.env' });

// --------------------
// 🧩 Core imports
// --------------------
const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerDocs } = require('./src/docs/swagger');
const adminRoutes = require('./src/routes/adminRoutes');

// --------------------
// ⚙️ App setup
// --------------------
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --------------------
// 🧠 Check env loaded
// --------------------
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET is missing in .env file!');
} else {
  console.log('🔑 JWT_SECRET loaded successfully');
}

// --------------------
// 📘 Swagger documentation
// --------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --------------------
// 🚀 API Routes
// --------------------
app.use('/api', require('./src/routes/authRoutes'));
app.use('/api/students', require('./src/routes/studentRoutes'));
app.use('/api/admin', adminRoutes);

// --------------------
// 🌐 Root route
// --------------------
app.get('/', (req, res) => res.send('Backend is running!'));

// --------------------
// 🏁 Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
