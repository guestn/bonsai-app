export type FeatureFlag = {
  id: string;
  defaultValue: boolean;
  description: string;
};

export type FeatureFlagValue = {
  value: boolean;
  source: FeatureSource;
};

export enum FeatureSource {
  ENV = 'env',
  LOCAL_STORAGE = 'localStorage',
  QUERY_PARAM = 'queryParam',
  DEFAULT = 'default',
}
