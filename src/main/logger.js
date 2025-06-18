const winston = require('winston');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

// 安全地获取日志目录
let logsDir;
try {
  if (app && app.getPath) {
    logsDir = path.join(app.getPath('userData'), 'logs');
  } else {
    // 如果app还没有准备好，使用临时目录
    logsDir = path.join(process.cwd(), 'logs');
  }

  // 确保日志目录存在
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  // 如果获取用户数据目录失败，使用当前工作目录
  logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let output = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      if (Object.keys(meta).length > 0) {
        output += ` ${JSON.stringify(meta)}`;
      }
      return output;
    })
  ),
  transports: [
    // 控制台输出 - 避免中文乱码
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          // 简化控制台输出，只显示基本信息
          return `${timestamp} ${level}: ${message}`;
        })
      )
    }),
    // 文件输出
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  ]
});

module.exports = logger;
