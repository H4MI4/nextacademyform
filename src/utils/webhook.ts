import { WEBHOOK_ENDPOINTS, API_CONFIG, WebhookData } from '@/types';
import { logger } from './logger';

// Retry with exponential backoff
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class WebhookService {
  private async sendWithRetry(
    url: string, 
    data: WebhookData, 
    maxRetries: number = API_CONFIG.MAX_RETRIES
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info('Sending webhook', { 
          url, 
          attempt, 
          maxRetries,
          dataType: data.testType 
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        logger.info('Webhook sent successfully', { 
          url, 
          attempt, 
          status: response.status 
        });

        return response;

      } catch (error) {
        lastError = error as Error;
        
        logger.warn('Webhook attempt failed', { 
          url, 
          attempt, 
          maxRetries,
          error: lastError.message 
        });

        if (attempt < maxRetries) {
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
          logger.info('Retrying webhook', { delay, nextAttempt: attempt + 1 });
          await sleep(delay);
        }
      }
    }

    logger.error('Webhook failed after all retries', lastError, { 
      url, 
      maxRetries,
      dataType: data.testType 
    });

    throw new Error(`Webhook failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  async sendQualificationData(data: WebhookData): Promise<void> {
    try {
      await this.sendWithRetry(WEBHOOK_ENDPOINTS.QUALIFICATION, data);
    } catch (error) {
      logger.error('Failed to send qualification data', error as Error, {
        athleteName: data.athleteInfo.fullName,
        totalScore: data.qualification.totalScore
      });
      throw error;
    }
  }

  async sendSchedulingData(data: WebhookData): Promise<void> {
    try {
      await this.sendWithRetry(WEBHOOK_ENDPOINTS.SCHEDULING, data);
    } catch (error) {
      logger.error('Failed to send scheduling data', error as Error, {
        athleteName: data.athleteInfo.fullName,
        scheduledDate: data.videoCallScheduling?.scheduledDate
      });
      throw error;
    }
  }
}

export const webhookService = new WebhookService();
