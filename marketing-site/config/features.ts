/**
 * Feature Flags Configuration
 * 
 * Toggle features on/off for the marketing site
 */

export const FEATURES = {
  /**
   * Enable full pricing and checkout flow
   * When false, shows "Coming Soon" message and beta access request form
   */
  PRICING_ENABLED: false, // Set to true to enable pricing
} as const

export type FeatureFlags = typeof FEATURES
