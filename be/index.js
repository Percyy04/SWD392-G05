const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
const PORT = 5000;

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
 * /hello:
 *   get:
 *     summary: Hello world endpoint
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Swagger API!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});
