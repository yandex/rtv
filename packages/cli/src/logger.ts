/**
 * CLI logger
 */
import { error as outputError } from './output';

const errorByType: Record<string, string> = {
  'request-timeout': 'Please check network connection and re-try again.',
  'tv-is-occupied': 'Use -f option to force command.',
};

export interface TypedError extends Error {
  type?: string;
}

export const logError = (error: TypedError, isVerbose: boolean) => {
  const message = isVerbose ? error.stack : error.message;
  const errorType = error.type;
  const hint = errorType && errorByType[errorType] ? `\n${errorByType[errorType]}` : '';
  outputError(`Error: ${message}.${hint}`);
};
