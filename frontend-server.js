const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080; // Frontend server on port 8080

// Serve static files from the public directory
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for frontend
app.get('/api/frontend-health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Frontend server is running on port 8080',
    serverType: 'frontend',
    backendUrl: 'http://localhost:3000'
  });
});

// Catch all other routes and serve index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Frontend server is running on port ${PORT}`);
  console.log(`📱 Open your browser and go to http://localhost:${PORT}`);
  console.log(`🔗 Backend API is available at http://localhost:3000`);
}); 