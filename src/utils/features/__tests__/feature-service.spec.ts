import {
  getFeatureValue,
  setLocalStorageValue,
  clearLocalStorageValue,
} from '../feature-service';
import { FEATURE_FLAGS } from '../feature-flags';

describe('Feature Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getFeatureValue', () => {
    it('should return default value when no overrides are set', () => {
      const result = getFeatureValue('EXAMPLE_FEATURE');
      expect(result.value).toBe(false);
      expect(result.source).toBe('default');
    });

    it('should return localStorage value when set', () => {
      setLocalStorageValue('EXAMPLE_FEATURE', true);
      const result = getFeatureValue('EXAMPLE_FEATURE');
      expect(result.value).toBe(true);
      expect(result.source).toBe('localStorage');
    });

    it('should return false for unknown feature flag', () => {
      const result = getFeatureValue('UNKNOWN_FEATURE' as any);
      expect(result.value).toBe(false);
      expect(result.source).toBe('default');
    });
  });

  describe('setLocalStorageValue', () => {
    it('should set localStorage value correctly', () => {
      setLocalStorageValue('EXAMPLE_FEATURE', true);
      expect(localStorage.getItem('feature_EXAMPLE_FEATURE')).toBe('true');
    });

    it('should handle unknown feature flag gracefully', () => {
      expect(() => {
        setLocalStorageValue('UNKNOWN_FEATURE' as any, true);
      }).not.toThrow();
    });
  });

  describe('clearLocalStorageValue', () => {
    it('should clear localStorage value', () => {
      setLocalStorageValue('EXAMPLE_FEATURE', true);
      clearLocalStorageValue('EXAMPLE_FEATURE');
      expect(localStorage.getItem('feature_EXAMPLE_FEATURE')).toBeNull();
    });

    it('should handle unknown feature flag gracefully', () => {
      expect(() => {
        clearLocalStorageValue('UNKNOWN_FEATURE' as any);
      }).not.toThrow();
    });
  });
});
