/**
 * Helpers
 */
import retry from 'p-retry';
import fetch from 'node-fetch';

/* eslint-disable-next-line @typescript-eslint/no-empty-function*/
export const noop = () => {};

export const safeJsonParse = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export const beautifyJson = (obj: Record<string, unknown>) => {
  return typeof obj !== 'undefined' ? JSON.stringify(obj, null, ' ') : '';
};

export const toBase64 = (str: string) => Buffer.from(str).toString('base64');

interface RetryFetchOptions {
  retries: number;
}

export const retryFetchJson = (url: string, { retries }: RetryFetchOptions) =>
  retry(
    async () => {
      const result = await fetch(url);
      return result.json();
    },
    { retries }
  );

export type VersionInfo = {
  version: string;
  major: number;
  minor: number;
  patch: number;
};

export const parseVersion = (version: string) => {
  const parts = version.split('.');
  return {
    version,
    major: parseInt(parts[0]),
    minor: parseInt(parts[1]),
    patch: parseInt(parts[2]),
  };
};

export function throwIf(condition: true, error: string | Error): never;
export function throwIf(condition: false, error: string | Error): void;
export function throwIf(condition: boolean, error: string | Error): void | never;
export function throwIf(condition: boolean, error: string | Error): void | never {
  if (condition) {
    const err = typeof error === 'string' ? new Error(error) : error;
    throw err;
  }
}

export interface DebugPageInfo {
  id: number;
  title: string;
  url: string;
}

export async function getChromeDevtoolsDebugInfo(url: string) {
  // when tv is just awakened, fetch can be failed
  const pages = (await retryFetchJson(url, { retries: 4 })) as DebugPageInfo[];
  if (!pages.length) {
    throw new Error(`No pages for debug.`);
  }
  return pages[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NotNullOrUndefined = Boolean as any as <T>(x: T | undefined | null) => x is T;
