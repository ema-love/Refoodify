/**
 * Refoodify Backend Server
 * Handles API proxying to bypass CORS restrictions
 * Serves static files and proxies requests to external APIs
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || '825ab033e0a4406388d0145f156d52be';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'f6a4207676msh4825f4491ed9993p1d8588jsnc4e1772dd94e';
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID || 'YOUR_CSE_ID';

// Helper to make HTTPS requests to external APIs
function makeHttpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: () => JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// API Endpoints
const apiRoutes = {
  '/api/recipes/findByIngredients': async (query) => {
    const ingredients = query.ingredients || '';
    const number = query.number || '6';
    const ranking = query.ranking || '-1';

    const options = {
      hostname: 'api.spoonacular.com',
      path: `/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${number}&ranking=${ranking}&apiKey=${SPOONACULAR_API_KEY}`,
      method: 'GET'
    };

    try {
      const response = await makeHttpsRequest(options);
      if (response.statusCode === 200) {
        return { success: true, data: response.json() };
      } else {
        return { success: false, error: 'Spoonacular API error', statusCode: response.statusCode };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  '/api/recipes/getDetails': async (query) => {
    const recipeId = query.recipeId || '';
    
    if (!recipeId) {
      return { success: false, error: 'Recipe ID required' };
    }

    const options = {
      hostname: 'api.spoonacular.com',
      path: `/recipes/${recipeId}/information?includeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`,
      method: 'GET'
    };

    try {
      const response = await makeHttpsRequest(options);
      if (response.statusCode === 200) {
        return { success: true, data: response.json() };
      } else {
        return { success: false, error: 'Spoonacular API error', statusCode: response.statusCode };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  '/api/recipes/search': async (query) => {
    const q = query.q || '';
    const number = query.number || '10';
    
    if (!q) {
      return { success: false, error: 'Search query required' };
    }

    const options = {
      hostname: 'api.spoonacular.com',
      path: `/recipes/complexSearch?query=${encodeURIComponent(q)}&number=${number}&apiKey=${SPOONACULAR_API_KEY}`,
      method: 'GET'
    };

    try {
      const response = await makeHttpsRequest(options);
      if (response.statusCode === 200) {
        return { success: true, data: response.json() };
      } else {
        return { success: false, error: 'Spoonacular API error', statusCode: response.statusCode };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  '/api/maps/geocode': async (query) => {
    const address = query.address || '';
    
    if (!address) {
      return { success: false, error: 'Address required' };
    }

    const options = {
      hostname: 'maps.googleapis.com',
      path: `/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`,
      method: 'GET'
    };

    try {
      const response = await makeHttpsRequest(options);
      if (response.statusCode === 200) {
        return { success: true, data: response.json() };
      } else {
        return { success: false, error: 'Google Maps API error', statusCode: response.statusCode };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  '/api/search/tips': async (query) => {
    const q = query.q || '';
    
    if (!q) {
      return { success: false, error: 'Search query required' };
    }

    // Mock search results for now (Google Custom Search requires setup)
    // In production, replace with actual Google Custom Search API call
    const mockTips = [
      {
        title: `Tips for storing ${q}`,
        link: `https://example.com/tips/${q}`,
        snippet: `Learn the best practices for keeping ${q} fresh and preventing waste.`
      },
      {
        title: `How to prevent ${q} spoilage`,
        link: `https://example.com/prevent-spoilage`,
        snippet: `Discover proven techniques to extend the shelf life of your ${q}.`
      },
      {
        title: `Recipes using leftover ${q}`,
        link: `https://example.com/recipes`,
        snippet: `Creative recipes to use up remaining ${q} before it goes bad.`
      }
    ];

    return { success: true, data: { items: mockTips } };
  }
};

// Static file server
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Main server request handler
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`${req.method} ${pathname}`);

  // API Routes
  if (pathname.startsWith('/api/')) {
    try {
      const handler = apiRoutes[pathname];
      if (handler) {
        const result = await handler(query);
        res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Static file serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Try adding .html extension
      const htmlPath = filePath + '.html';
      fs.stat(htmlPath, (err2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          serveStaticFile(htmlPath, res);
        }
      });
    } else if (stats.isDirectory()) {
      // Serve index.html from directory
      serveStaticFile(path.join(filePath, 'index.html'), res);
    } else {
      serveStaticFile(filePath, res);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Refoodify Server Running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log('API Endpoints:');
  console.log(`  GET  /api/recipes/findByIngredients?ingredients=...&number=...`);
  console.log(`  GET  /api/recipes/search?q=...&number=...`);
  console.log(`  GET  /api/recipes/getDetails?recipeId=...`);
  console.log(`  GET  /api/maps/geocode?address=...`);
  console.log(`  GET  /api/search/tips?q=...`);
  console.log('\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
