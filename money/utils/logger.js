// utils/logger.js
import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime
});

const httpLogger = pinoHttp({
  logger,
  autoLogging: { ignorePaths: ['/health'] },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        id: req.id
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode
      };
    }
  }
});

export { logger, httpLogger };
