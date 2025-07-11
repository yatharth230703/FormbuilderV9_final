
import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  module: string;
  message: string;
}

class FileLogger {
  private logDir: string;

  constructor(logDir: string = 'logs') {
    this.logDir = logDir;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.message}\n`;
  }

  private getLogFilePath(moduleName: string): string {
    return path.join(this.logDir, `${moduleName}.log`);
  }

  log(moduleName: string, message: string, level: 'log' | 'error' | 'warn' | 'info' = 'log') {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: moduleName,
      message: typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message)
    };

    const logLine = this.formatLogEntry(entry);
    const logFile = this.getLogFilePath(moduleName);

    // Write to file
    fs.appendFileSync(logFile, logLine);

    // Also log to console
    console[level](`[${moduleName}] ${message}`);
  }

  error(moduleName: string, message: string) {
    this.log(moduleName, message, 'error');
  }

  warn(moduleName: string, message: string) {
    this.log(moduleName, message, 'warn');
  }

  info(moduleName: string, message: string) {
    this.log(moduleName, message, 'info');
  }

  // Clear logs for a specific module
  clearModuleLogs(moduleName: string) {
    const logFile = this.getLogFilePath(moduleName);
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
  }

  // Get recent logs for a module
  getModuleLogs(moduleName: string, lines: number = 100): string[] {
    const logFile = this.getLogFilePath(moduleName);
    if (!fs.existsSync(logFile)) {
      return [];
    }

    const content = fs.readFileSync(logFile, 'utf-8');
    const allLines = content.split('\n').filter(line => line.trim());
    return allLines.slice(-lines);
  }
}

export const fileLogger = new FileLogger();
