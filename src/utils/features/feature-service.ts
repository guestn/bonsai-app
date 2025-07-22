import { useMemo } from 'react';
import { env } from '@/utils/env';
import { FeatureFlag, FeatureFlagValue, FeatureSource } from './types';
import { featureFlags, FEATURE_FLAGS, FeatureFlagId } from './feature-flags';

const FLAG_PREFIX = 'feature_';

/*
 * Feature flag service
 *
 * This service is used to check if a feature flag is enabled.
 * It checks the URL query parameters, localStorage, environment variables in that order.
 * If a feature flag is not found in any of these sources, it returns the default value.
 * env values are in the format "VITE_FEATURE_{{featureID}}". Query params and localStorage
 * are used in the format "feature_{{featureID}}".
 *
 * example use in React code:
 *   const { isFeatureEnabled, FEATURE_FLAGS } = useFeatureService();
 *
 *   const isExampleFeatureEnabled = isFeatureEnabled(FEATURE_FLAGS.EXAMPLE_FEATURE);
 */

export const getEnvValue = (feature: FeatureFlag): boolean | null => {
  const envKey = `VITE_FEATURE_${feature.id}`;
  const envValue = env[envKey];
  return envValue ? envValue.toLowerCase() === 'true' : null;
};

const getQueryParamValue = (feature: FeatureFlag): boolean | null => {
  const params = new URLSearchParams(window.location.search);
  const paramValue = params.get(`${FLAG_PREFIX}${feature.id}`);
  return paramValue ? paramValue.toLowerCase() === 'true' : null;
};

const getLocalStorageValue = (feature: FeatureFlag): boolean | null => {
  const value = localStorage.getItem(`${FLAG_PREFIX}${feature.id}`);
  return value ? value === 'true' : null;
};

export const getFeatureValue = (featureId: FeatureFlagId): FeatureFlagValue => {
  const feature = featureFlags[featureId];
  if (!feature) {
    console.warn(`Feature flag ${featureId} not found`);
    return { value: false, source: FeatureSource.DEFAULT };
  }

  const queryValue = getQueryParamValue(feature);
  if (queryValue !== null) {
    return { value: queryValue, source: FeatureSource.QUERY_PARAM };
  }

  const localStorageValue = getLocalStorageValue(feature);
  if (localStorageValue !== null) {
    return { value: localStorageValue, source: FeatureSource.LOCAL_STORAGE };
  }

  const envValue = getEnvValue(feature);
  if (envValue !== null) {
    return { value: envValue, source: FeatureSource.ENV };
  }

  return { value: feature.defaultValue, source: FeatureSource.DEFAULT };
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

export const useFeatureService = () => {
  const isFeatureEnabled = useMemo(
    () =>
      (featureId: FeatureFlagId): boolean =>
        getFeatureValue(featureId).value,
    [],
  );

  return {
    isFeatureEnabled,
    FEATURE_FLAGS,
  };
};
