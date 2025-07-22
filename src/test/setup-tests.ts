import '@testing-library/jest-dom';
import React from 'react';
import { generateTestingUtils } from 'eth-testing';

// Mock environment variables for tests
export const mockEnv = {
  VITE_SOME_API_URL: 'http://mock-some-api',
};

// Mock import.meta.env for Jest
jest.mock('@/utils/env', () => ({
  env: mockEnv,
}));

// Also set process.env for legacy support
process.env = { ...process.env, ...mockEnv };

// Global/window mocks
window.fetch = jest.fn() as unknown as typeof fetch;
global.React = React;

// Testing Setup

beforeAll(() => {
  const testingUtils = generateTestingUtils({ providerType: 'MetaMask' });
  // @ts-expect-error
  window.ethereum = testingUtils.getProvider();
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
