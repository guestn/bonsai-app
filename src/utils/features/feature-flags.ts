import { FeatureFlag } from '../features/types';

export const FEATURE_FLAGS = {
  EXAMPLE_FEATURE: 'EXAMPLE_FEATURE',
  SYMBIOTIC_PUFETH: 'SYMBIOTIC_PUFETH',
  CARROT_REWARDS_CLAIM: 'CARROT_REWARDS_CLAIM',
  CARROT_STAKING: 'CARROT_STAKING',
  SHOW_EXTRA_CARROT_CAMPAIGN: 'SHOW_EXTRA_CARROT_CAMPAIGN',
  CARROT_REWARDS_UNWRAP: 'CARROT_REWARDS_UNWRAP',
  BRIDGE: 'BRIDGE',
} as const;

export type FeatureFlagId = keyof typeof FEATURE_FLAGS;

export const featureFlags: Record<FeatureFlagId, FeatureFlag> = {
  EXAMPLE_FEATURE: {
    id: FEATURE_FLAGS.EXAMPLE_FEATURE,
    defaultValue: false,
    description: 'An example feature flag',
  },
  SYMBIOTIC_PUFETH: {
    id: FEATURE_FLAGS.SYMBIOTIC_PUFETH,
    defaultValue: false,
    description: 'Enable/disable the Symbiotic pufETH staking option',
  },
  CARROT_REWARDS_CLAIM: {
    id: FEATURE_FLAGS.CARROT_REWARDS_CLAIM,
    defaultValue: false,
    description: 'Enable/disable the Carrot rewards claim option',
  },
  CARROT_STAKING: {
    id: FEATURE_FLAGS.CARROT_STAKING,
    defaultValue: false,
    description: 'Enable/disable the CARROT staking option',
  },
  SHOW_EXTRA_CARROT_CAMPAIGN: {
    id: FEATURE_FLAGS.SHOW_EXTRA_CARROT_CAMPAIGN,
    defaultValue: false,
    description: 'Enable/disable the extra CARROT campaign',
  },
  CARROT_REWARDS_UNWRAP: {
    id: FEATURE_FLAGS.CARROT_REWARDS_UNWRAP,
    defaultValue: false,
    description: 'Enable/disable the unwrap UI for Carrot',
  },
  BRIDGE: {
    id: FEATURE_FLAGS.BRIDGE,
    defaultValue: false,
    description: 'Enable/disable the bridge feature',
  },
};
