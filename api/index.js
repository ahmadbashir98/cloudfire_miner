// Vercel serverless function handler
module.exports = async (req, res) => {
  // Import the built Express app
  const app = require('../dist/index.cjs');
  
  // Get the default export or the app itself
  const handler = app.default || app;
  
  // Execute the Express app
  return handler(req, res);
};
