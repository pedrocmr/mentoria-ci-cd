/**
 * Feature Flag Middleware
 * 
 * Provides middleware and utility functions for easy feature flag integration
 * in larger applications. This demonstrates how teams can easily integrate
 * feature flags into their trunk-based development workflow.
 */

/**
 * Create a feature flag middleware for HTTP requests
 * @param {FeatureFlagService} featureFlagService - The feature flag service instance
 * @returns {Function} - Express-style middleware function
 */
function createFeatureFlagMiddleware(featureFlagService) {
  return function featureFlagMiddleware(req, res, next) {
    // Extract context from request
    const context = {
      userId: req.headers['x-user-id'] || req.query.userId || 'anonymous',
      team: req.headers['x-team'] || req.query.team || null,
      userAgent: req.headers['user-agent'] || '',
      ip: req.connection.remoteAddress || req.socket.remoteAddress || null
    };

    // Add feature flag helper methods to request object
    req.featureFlags = {
      isEnabled: (flagName) => featureFlagService.isEnabled(flagName, context),
      getAllFlags: () => featureFlagService.getAllFlags(context),
      context: context
    };

    // Add feature flag helper methods to response object
    res.featureFlags = {
      // Send response only if feature is enabled
      sendIfEnabled: (flagName, successResponse, disabledResponse = null) => {
        if (featureFlagService.isEnabled(flagName, context)) {
          res.json(successResponse);
        } else if (disabledResponse) {
          res.json(disabledResponse);
        } else {
          res.status(404).json({ error: 'Feature not available' });
        }
      },
      
      // Add feature flag info to response headers
      addFlagHeaders: (flagNames = []) => {
        if (flagNames.length === 0) {
          // Add all flags if none specified
          const allFlags = featureFlagService.getAllFlags(context);
          flagNames = Object.keys(allFlags);
        }
        
        flagNames.forEach(flagName => {
          const isEnabled = featureFlagService.isEnabled(flagName, context);
          res.setHeader(`X-Feature-${flagName}`, isEnabled ? 'enabled' : 'disabled');
        });
      }
    };

    next();
  };
}

/**
 * Feature flag decorator for functions
 * @param {FeatureFlagService} featureFlagService - The feature flag service instance
 * @param {string} flagName - Name of the feature flag
 * @param {Function} enabledFunction - Function to execute when flag is enabled
 * @param {Function} disabledFunction - Function to execute when flag is disabled (optional)
 * @returns {Function} - Wrapped function
 */
function withFeatureFlag(featureFlagService, flagName, enabledFunction, disabledFunction = null) {
  return function(...args) {
    // Extract context from arguments if available
    const context = args.find(arg => arg && typeof arg === 'object' && arg.userId) || {};
    
    if (featureFlagService.isEnabled(flagName, context)) {
      return enabledFunction.apply(this, args);
    } else if (disabledFunction) {
      return disabledFunction.apply(this, args);
    } else {
      console.log(`🚩 Feature '${flagName}' is disabled, skipping execution`);
      return null;
    }
  };
}

/**
 * Create a feature flag gate for conditional code execution
 * @param {FeatureFlagService} featureFlagService - The feature flag service instance
 * @returns {Object} - Feature flag gate with helper methods
 */
function createFeatureFlagGate(featureFlagService) {
  return {
    /**
     * Execute code conditionally based on feature flag
     * @param {string} flagName - Name of the feature flag
     * @param {Function} enabledCallback - Code to execute when enabled
     * @param {Function} disabledCallback - Code to execute when disabled (optional)
     * @param {Object} context - Feature flag evaluation context
     */
    when: (flagName, enabledCallback, disabledCallback = null, context = {}) => {
      if (featureFlagService.isEnabled(flagName, context)) {
        return enabledCallback();
      } else if (disabledCallback) {
        return disabledCallback();
      }
      return null;
    },

    /**
     * Get a value conditionally based on feature flag
     * @param {string} flagName - Name of the feature flag
     * @param {*} enabledValue - Value to return when enabled
     * @param {*} disabledValue - Value to return when disabled
     * @param {Object} context - Feature flag evaluation context
     */
    value: (flagName, enabledValue, disabledValue, context = {}) => {
      return featureFlagService.isEnabled(flagName, context) ? enabledValue : disabledValue;
    },

    /**
     * Create a team-aware feature gate
     * @param {string} team - Team name
     * @returns {Object} - Team-specific feature gate
     */
    forTeam: (team) => {
      const teamContext = { team };
      return {
        when: (flagName, enabledCallback, disabledCallback = null) => {
          if (featureFlagService.isEnabled(flagName, teamContext)) {
            return enabledCallback();
          } else if (disabledCallback) {
            return disabledCallback();
          }
          return null;
        },
        value: (flagName, enabledValue, disabledValue) => {
          return featureFlagService.isEnabled(flagName, teamContext) ? enabledValue : disabledValue;
        }
      };
    }
  };
}

/**
 * Team-specific feature flag helpers for trunk-based development
 */
class TeamFeatureGate {
  constructor(featureFlagService, teamName) {
    this.featureFlagService = featureFlagService;
    this.teamName = teamName;
    this.context = { team: teamName };
  }

  /**
   * Check if a feature is enabled for this team
   * @param {string} flagName - Name of the feature flag
   * @param {Object} additionalContext - Additional context to merge
   * @returns {boolean} - Whether the feature is enabled
   */
  isEnabled(flagName, additionalContext = {}) {
    const context = { ...this.context, ...additionalContext };
    return this.featureFlagService.isEnabled(flagName, context);
  }

  /**
   * Execute team-specific feature code
   * @param {string} flagName - Name of the feature flag
   * @param {Function} callback - Code to execute if enabled
   * @param {Object} additionalContext - Additional context
   */
  execute(flagName, callback, additionalContext = {}) {
    if (this.isEnabled(flagName, additionalContext)) {
      console.log(`🚩 Team '${this.teamName}' executing feature '${flagName}'`);
      return callback();
    } else {
      console.log(`🚩 Feature '${flagName}' disabled for team '${this.teamName}'`);
      return null;
    }
  }

  /**
   * Get team-specific configuration
   * @param {string} flagName - Name of the feature flag
   * @param {*} enabledConfig - Configuration when enabled
   * @param {*} disabledConfig - Configuration when disabled
   * @param {Object} additionalContext - Additional context
   */
  getConfig(flagName, enabledConfig, disabledConfig, additionalContext = {}) {
    return this.isEnabled(flagName, additionalContext) ? enabledConfig : disabledConfig;
  }
}

module.exports = {
  createFeatureFlagMiddleware,
  withFeatureFlag,
  createFeatureFlagGate,
  TeamFeatureGate
};