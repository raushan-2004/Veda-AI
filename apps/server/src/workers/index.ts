import { aiGenerationWorker } from './ai-generation.worker';
import { pdfGenerationWorker } from './pdf-generation.worker';
import { logger } from '@/utils/logger';

export function initWorkers(): void {
  // Access instances to trigger module initialization and boot active listeners
  const aiActive = !!aiGenerationWorker;
  const pdfActive = !!pdfGenerationWorker;

  if (aiActive && pdfActive) {
    logger.info('🚀 Background BullMQ workers active & listening to Redis queues');
  } else {
    logger.warn('⚠️ Some background BullMQ workers failed to initialize');
  }
}

export { aiGenerationWorker } from './ai-generation.worker';
export { pdfGenerationWorker } from './pdf-generation.worker';
