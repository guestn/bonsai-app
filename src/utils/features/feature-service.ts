import { useMemo } from 'react';
import { env } from '@/utils/env';
import { FeatureFlag, FeatureFlagValue, FeatureSource } from './types';
import { featureFlags, FEATURE_FLAGS, FeatureFlagId } from './feature-flags';

const FLAG_PREFIX = 'feature_';

/**
 * Get feature flag value from environment variables
 * Looks for VITE_FEATURE_{FLAG_ID} in environment
 */

export const getEnvValue = (feature: FeatureFlag): boolean | null => {
  const envKey = `VITE_FEATURE_${feature.id}`;
  const envValue = (env as Record<string, any>)[envKey];
  return envValue !== undefined ? Boolean(envValue) : null;
};

const getQueryParamValue = (feature: FeatureFlag): boolean | null => {
  const params = new URLSearchParams(window.location.search);
  const paramValue = params.get(`${FLAG_PREFIX}${feature.id}`);
  return paramValue ? paramValue === 'true' : null;
};

const getLocalStorageValue = (feature: FeatureFlag): boolean | null => {
  const value = localStorage.getItem(`${FLAG_PREFIX}${feature.id}`);
  return value ? value === 'true' : null;
};

export const getFeatureValue = (featureId: FeatureFlagId): FeatureFlagValue => {
  const feature = featureFlags[featureId];
  if (!feature) {
    console.warn(`Feature flag ${featureId} not found`);
    return { value: false, source: 'default' };
  }

  // Check localStorage first (highest priority)
  const localStorageValue = getLocalStorageValue(feature);
  if (localStorageValue !== null) {
    return { value: localStorageValue, source: 'localStorage' };
  }

  // Check query parameters (second priority)
  const queryValue = getQueryParamValue(feature);
  if (queryValue !== null) {
    return { value: queryValue, source: 'query' };
  }

  // Check environment variables (third priority)
  const envValue = getEnvValue(feature);
  if (envValue !== null) {
    return { value: envValue, source: 'env' };
  }

  // Fall back to default value
  return { value: feature.defaultValue, source: 'default' };
};

export const setLocalStorageValue = (
  featureId: FeatureFlagId,
  value: boolean,
): void => {
  const feature = featureFlags[featureId];
  if (!feature) return;
  localStorage.setItem(`${FLAG_PREFIX}${feature.id}`, value.toString());
};

export const clearLocalStorageValue = (featureId: FeatureFlagId): void => {
  const feature = featureFlags[featureId];
  if (!feature) return;
  localStorage.removeItem(`${FLAG_PREFIX}${feature.id}`);
};

export const useFeatureFlag = () => {
  const isFeatureEnabled = useMemo(
    () =>
      (featureId: FeatureFlagId): boolean =>
        getFeatureValue(featureId).value,
    [],
  );

  return { isFeatureEnabled };
};
