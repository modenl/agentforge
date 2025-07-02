const { jsonrepair } = require('jsonrepair');

class JsonRepairUtil {
  static parse(jsonString, options = {}) {
    const { 
      fallbackValue = null, 
      logErrors = true,
      description = 'JSON parse'
    } = options;

    try {
      // First try standard JSON parse
      return JSON.parse(jsonString);
    } catch (error) {
      // If standard parse fails, try jsonrepair
      try {
        const repaired = jsonrepair(jsonString);
        if (logErrors) {
          console.warn(`⚠️  [JSON_REPAIR] ${description}: Repaired malformed JSON`);
        }
        return JSON.parse(repaired);
      } catch (repairError) {
        if (logErrors) {
          console.error(`❌ [JSON_REPAIR] ${description}: Failed to repair JSON:`, repairError.message);
        }
        return fallbackValue;
      }
    }
  }

  static stringify(obj, space = 2) {
    try {
      return JSON.stringify(obj, null, space);
    } catch (error) {
      // Handle circular references
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }, space);
    }
  }

  static repair(jsonString) {
    try {
      return jsonrepair(jsonString);
    } catch (error) {
      throw new Error(`Failed to repair JSON: ${error.message}`);
    }
  }

  static isValidJson(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  static tryRepairAndValidate(jsonString) {
    try {
      const repaired = jsonrepair(jsonString);
      JSON.parse(repaired);
      return { success: true, repaired, error: null };
    } catch (error) {
      return { success: false, repaired: null, error: error.message };
    }
  }
}

module.exports = JsonRepairUtil;