const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./config/db');
const verifyRoutes = require('./routes/verifyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Enterprise Security & Parsing Middleware
app.disable('x-powered-by');

app.use(helmet({
    contentSecurityPolicy: false, // Local admin UI scripts and styles
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' }, // Anti-Clickjacking protection
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // XSS filter protection
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    dnsPrefetchControl: { allow: false }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key']
}));

// Strictly enforce 100KB payload limit to prevent buffer overflow/DoS memory flooding attacks
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Serve Static Frontend Admin Dashboard with zero-caching for instant hot reload
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// API Routes
app.use('/api', verifyRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for Unmatched API Endpoints
app.all('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        requested_path: req.originalUrl,
        method: req.method
    });
});

// Fallback to Dashboard SPA for Web Navigation
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server & Initialize Database
async function startServer() {
    console.log('────────────────────────────────────────────────────────────');
    console.log('⚡ CBN TECH LICENSE CONTROLLER API');
    console.log('────────────────────────────────────────────────────────────');

    // Initialize Database
    await initDatabase();

    function listen(port) {
        const server = app.listen(port, () => {
            console.log(`[Server] ✓ License Server running on http://localhost:${port}`);
            console.log(`[Server] 🌐 Client Verification Endpoint: http://localhost:${port}/api/verify-license`);
            console.log(`[Server] 🖥️ Admin Controller Dashboard: http://localhost:${port}/`);
            console.log('────────────────────────────────────────────────────────────');
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`[Server] ⚠ Port ${port} is in use, trying port ${Number(port) + 1}...`);
                listen(Number(port) + 1);
            } else {
                console.error('[Server Error]', err);
            }
        });
    }

    listen(PORT);
}

startServer();
