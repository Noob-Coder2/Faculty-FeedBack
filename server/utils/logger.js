// server/utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Include stack traces
  winston.format.json() // JSON output for structured logging
);

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Debug in dev, info in prod
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorize logs in console
        winston.format.simple() // Simple format for console
      ),
    }),
    // Error log file (rotated daily)
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d', // Keep 14 days of logs
    }),
    // Combined log file (all levels)
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

// Add request context to logs (e.g., userId, URL)
const addRequestContext = (req) => {
  return {
    userId: req.user?.id || 'anonymous',
    method: req.method,
    url: req.originalUrl,
  };
};

// Helper functions for logging with context
logger.errorWithContext = (message, req, error) => {
  logger.error(message, { ...addRequestContext(req), error: error?.message, stack: error?.stack });
};

logger.warnWithContext = (message, req, meta = {}) => {
  logger.warn(message, { ...addRequestContext(req), ...meta });
};

logger.infoWithContext = (message, req, meta = {}) => {
  logger.info(message, { ...addRequestContext(req), ...meta });
};

logger.debugWithContext = (message, req, meta = {}) => {
  logger.debug(message, { ...addRequestContext(req), ...meta });
};

module.exports = logger;
