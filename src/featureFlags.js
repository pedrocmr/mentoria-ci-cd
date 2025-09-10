/**
 * Feature Flag Service
 * 
 * This service provides a centralized way to manage feature flags for trunk-based development.
 * It allows large teams to work on different features simultaneously on the main branch
 * while controlling feature visibility per environment.
 */

class FeatureFlagService {
  constructor(config) {
    this.config = config;
    this.flags = config.features || {};
    this.environment = config.environment || 'development';
    
    // Runtime flag overrides (simulates external feature flag service)
    this.runtimeOverrides = {};
    
    console.log(`🚩 Feature Flag Service initialized for '${this.environment}' environment`);
    console.log(`📊 Loaded ${Object.keys(this.flags).length} feature flags`);
  }

  /**
   * Check if a feature flag is enabled
   * @param {string} flagName - Name of the feature flag
   * @param {Object} context - Optional context (user, team, percentage, etc.)
   * @returns {boolean} - Whether the feature is enabled
   */
  isEnabled(flagName, context = {}) {
    // Check runtime overrides first (highest priority)
    if (this.runtimeOverrides.hasOwnProperty(flagName)) {
      return this.evaluateFlag(this.runtimeOverrides[flagName], context);
    }

    // Check environment configuration
    if (this.flags.hasOwnProperty(flagName)) {
      return this.evaluateFlag(this.flags[flagName], context);
    }

    // Default to false for unknown flags
    console.warn(`⚠️  Unknown feature flag '${flagName}', defaulting to false`);
    return false;
  }

  /**
   * Evaluate a feature flag value (supports boolean, percentage, and complex rules)
   * @param {*} flagValue - The flag configuration
   * @param {Object} context - Evaluation context
   * @returns {boolean} - Evaluated result
   */
  evaluateFlag(flagValue, context) {
    // Simple boolean flag
    if (typeof flagValue === 'boolean') {
      return flagValue;
    }

    // Percentage-based flag (0-100)
    if (typeof flagValue === 'number') {
      // Use user ID for consistent percentage rollout if available
      if (context.userId) {
        const hash = this.simpleHash(context.userId) % 100;
        return hash < flagValue;
      } else {
        // Fallback to random for anonymous users
        const randomValue = Math.random() * 100;
        return randomValue < flagValue;
      }
    }

    // Complex flag object
    if (typeof flagValue === 'object' && flagValue !== null) {
      // Environment-specific override
      if (flagValue.environments && flagValue.environments[this.environment] !== undefined) {
        return this.evaluateFlag(flagValue.environments[this.environment], context);
      }

      // Team-specific flags
      if (flagValue.teams && context.team) {
        const teamConfig = flagValue.teams[context.team];
        if (teamConfig !== undefined) {
          return this.evaluateFlag(teamConfig, context);
        }
      }

      // User percentage rollout
      if (flagValue.percentage !== undefined) {
        const userId = context.userId || 'anonymous';
        const hash = this.simpleHash(userId) % 100;
        return hash < flagValue.percentage;
      }

      // Default value for complex flags
      return flagValue.default || false;
    }

    return false;
  }

  /**
   * Get all feature flags with their current states
   * @param {Object} context - Evaluation context
   * @returns {Object} - All flags with their evaluated states
   */
  getAllFlags(context = {}) {
    const result = {};
    
    // Get all flag names from both config and runtime overrides
    const allFlagNames = new Set([
      ...Object.keys(this.flags),
      ...Object.keys(this.runtimeOverrides)
    ]);

    for (const flagName of allFlagNames) {
      result[flagName] = {
        enabled: this.isEnabled(flagName, context),
        source: this.runtimeOverrides.hasOwnProperty(flagName) ? 'runtime' : 'config'
      };
    }

    return result;
  }

  /**
   * Set a runtime override for a feature flag (simulates external management)
   * @param {string} flagName - Name of the feature flag
   * @param {*} flagValue - New flag value
   */
  setRuntimeOverride(flagName, flagValue) {
    this.runtimeOverrides[flagName] = flagValue;
    console.log(`🔄 Runtime override set for '${flagName}': ${JSON.stringify(flagValue)}`);
  }

  /**
   * Remove a runtime override
   * @param {string} flagName - Name of the feature flag
   */
  removeRuntimeOverride(flagName) {
    delete this.runtimeOverrides[flagName];
    console.log(`🗑️  Runtime override removed for '${flagName}'`);
  }

  /**
   * Get feature flag metadata for debugging and monitoring
   * @returns {Object} - Service metadata
   */
  getMetadata() {
    return {
      environment: this.environment,
      totalFlags: Object.keys(this.flags).length,
      runtimeOverrides: Object.keys(this.runtimeOverrides).length,
      availableFlags: Object.keys(this.flags),
      overriddenFlags: Object.keys(this.runtimeOverrides)
    };
  }

  /**
   * Simple hash function for consistent user-based percentage rollouts
   * @param {string} str - String to hash
   * @returns {number} - Hash value
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

module.exports = FeatureFlagService;