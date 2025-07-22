import { renderHook } from '@testing-library/react';
import { env } from '@/utils/env';
import { useFeatureService, getFeatureValue } from '../feature-service';
import { FEATURE_FLAGS } from '../../features/feature-flags';
import { FeatureSource } from '../types';

jest.mock('@/utils/env', () => ({
  env: {},
}));

describe('Feature Service', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');

    jest.resetModules();
  });

  it('returns default value when no overrides exist', () => {
    const result = getFeatureValue(FEATURE_FLAGS.EXAMPLE_FEATURE);
    expect(result.value).toBe(false);
    expect(result.source).toBe(FeatureSource.DEFAULT);
  });

  it('reads value from localStorage', () => {
    localStorage.setItem('feature_EXAMPLE_FEATURE', 'true');

    const result = getFeatureValue(FEATURE_FLAGS.EXAMPLE_FEATURE);
    expect(result.value).toBe(true);
    expect(result.source).toBe(FeatureSource.LOCAL_STORAGE);
  });

  it('reads value from query parameters', () => {
    window.history.pushState({}, '', '?feature_EXAMPLE_FEATURE=true');

    const result = getFeatureValue(FEATURE_FLAGS.EXAMPLE_FEATURE);
    expect(result.value).toBe(true);
    expect(result.source).toBe(FeatureSource.QUERY_PARAM);
  });

  it('reads value from env', () => {
    jest.mocked(env).VITE_FEATURE_EXAMPLE_FEATURE = 'true';

    const result = getFeatureValue(FEATURE_FLAGS.EXAMPLE_FEATURE);
    expect(result.value).toBe(true);
    expect(result.source).toBe(FeatureSource.ENV);
  });

  it('provides memoized isFeatureEnabled function', () => {
    localStorage.setItem('feature_EXAMPLE_FEATURE', 'true');

    const { result } = renderHook(() => useFeatureService());
    expect(result.current.isFeatureEnabled(FEATURE_FLAGS.EXAMPLE_FEATURE)).toBe(
      true,
    );
  });
});
