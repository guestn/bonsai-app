export type FeatureFlag = {
  id: string;
  defaultValue: boolean;
  description: string;
};

export type FeatureFlagValue = {
  value: boolean;
  source: FeatureSource;
};

export type FeatureSource = 'default' | 'env' | 'query' | 'localStorage';
