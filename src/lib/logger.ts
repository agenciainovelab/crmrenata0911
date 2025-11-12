/**
 * Sistema de logging estruturado
 * Em produção, integrar com Sentry, Datadog ou similar
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    const formatted = this.formatMessage('info', message, context);
    console.log(formatted);
    
    // TODO: Enviar para serviço de logging em produção
    // if (!this.isDevelopment) {
    //   sendToLoggingService('info', message, context);
    // }
  }

  warn(message: string, context?: LogContext) {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);
    
    // TODO: Enviar para serviço de logging em produção
    // if (!this.isDevelopment) {
    //   sendToLoggingService('warn', message, context);
    // }
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    };
    
    const formatted = this.formatMessage('error', message, errorContext);
    console.error(formatted);
    
    // TODO: Enviar para Sentry ou similar em produção
    // if (!this.isDevelopment && typeof window !== 'undefined') {
    //   Sentry.captureException(error, {
    //     contexts: { custom: context },
    //   });
    // }
  }

  debug(message: string, context?: LogContext) {
    if (!this.isDevelopment) return;
    
    const formatted = this.formatMessage('debug', message, context);
    console.debug(formatted);
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: LogContext) {
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (duration > 1000) {
      this.warn(message, { ...context, duration, operation });
    } else {
      this.debug(message, { ...context, duration, operation });
    }
  }

  /**
   * Log de auditoria (ações importantes do usuário)
   */
  audit(action: string, userId: string, context?: LogContext) {
    this.info(`Audit: ${action}`, {
      ...context,
      userId,
      action,
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Salvar em tabela de auditoria no banco de dados
  }
}

// Exportar instância singleton
export const logger = new Logger();

/**
 * Helper para medir performance de funções
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(operation, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Error in ${operation} after ${duration}ms`, error as Error);
    throw error;
  }
}
