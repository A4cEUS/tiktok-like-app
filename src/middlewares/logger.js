const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file streams
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });

// Format log entry
const formatLogEntry = (req, res, duration) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const statusCode = res.statusCode;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    
    return `[${timestamp}] ${method} ${url} ${statusCode} ${duration}ms - ${ip} - ${userAgent}\n`;
};

// Access logger middleware
const accessLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = formatLogEntry(req, res, duration);
        accessLogStream.write(logEntry);
    });
    
    next();
};

// Error logger middleware
const errorLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress;
    
    const errorLog = `[${timestamp}] ERROR ${method} ${url} - ${err.message} - ${ip} - ${userAgent}\nStack: ${err.stack}\n`;
    errorLogStream.write(errorLog);
    
    console.error(err); // Also log to console
    next(err);
};

module.exports = {
    accessLogger,
    errorLogger
};