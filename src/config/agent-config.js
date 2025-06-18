const { APP_CONFIG } = require('./config');

/**
 * Agent配置工具函数
 */
class AgentConfigManager {
  /**
   * 获取指定agent的完整配置
   * @param {string} agentName - Agent名称 (orchestrator, ui, education, main)
   * @returns {object} 完整的agent配置
   */
  static getAgentConfig(agentName) {
    const lowerAgentName = agentName.toLowerCase();
    const specificConfig = APP_CONFIG.agents[lowerAgentName] || {};

    // 合并默认配置和特定配置
    return {
      ...APP_CONFIG.agents.defaults,
      ...specificConfig,
      agentName: agentName
    };
  }

  /**
   * 获取所有agents的配置
   * @returns {object} 所有agents的配置映射
   */
  static getAllAgentsConfig() {
    const allConfigs = {};

    // 获取所有定义的agent配置
    Object.keys(APP_CONFIG.agents).forEach(agentName => {
      if (agentName !== 'defaults') {
        allConfigs[agentName] = this.getAgentConfig(agentName);
      }
    });

    return allConfigs;
  }

  /**
   * 为GPT API调用构建请求配置
   * @param {string} agentName - Agent名称
   * @param {object} additionalOptions - 额外选项
   * @returns {object} GPT API请求配置
   */
  static buildGPTRequestConfig(agentName, additionalOptions = {}) {
    const config = this.getAgentConfig(agentName);

    const requestConfig = {
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      ...additionalOptions
    };

    // 对于推理模型使用不同的参数名
    if (config.model && config.model.startsWith('o1')) {
      delete requestConfig.temperature; // o1模型不支持temperature
      requestConfig.max_completion_tokens = requestConfig.max_tokens;
      delete requestConfig.max_tokens;
    }

    return requestConfig;
  }

  /**
   * 检查agent是否支持流式响应
   * @param {string} agentName - Agent名称
   * @returns {boolean} 是否支持流式响应
   */
  static supportsStreaming(agentName) {
    const config = this.getAgentConfig(agentName);
    return config.enableStream;
  }

  /**
   * 获取agent的最大历史消息数量
   * @param {string} agentName - Agent名称
   * @returns {number} 最大历史消息数量
   */
  static getMaxHistoryMessages(agentName) {
    const config = this.getAgentConfig(agentName);
    return config.maxHistoryMessages;
  }

  /**
   * 打印所有agents的配置信息（用于调试）
   */
  static printConfigSummary() {
    console.log('\n🤖 AI Agents Configuration Summary:');
    console.log('=====================================');

    const allConfigs = this.getAllAgentsConfig();

    Object.entries(allConfigs).forEach(([agentName, config]) => {
      console.log(`\n📋 ${agentName.toUpperCase()} Agent:`);
      console.log(`   Model: ${config.model}`);
      console.log(`   Temperature: ${config.temperature}`);
      console.log(`   Max Tokens: ${config.maxTokens}`);
      console.log(`   History Limit: ${config.maxHistoryMessages}`);
      console.log(`   Streaming: ${config.enableStream ? '✅' : '❌'}`);
    });

    console.log('\n=====================================\n');
  }

  /**
   * 验证agent配置的有效性
   * @param {string} agentName - Agent名称
   * @returns {object} 验证结果
   */
  static validateAgentConfig(agentName) {
    try {
      const config = this.getAgentConfig(agentName);
      const issues = [];

      // 检查必需字段
      if (!config.model) issues.push('Model not specified');
      if (typeof config.temperature !== 'number') issues.push('Invalid temperature');
      if (typeof config.maxTokens !== 'number') issues.push('Invalid maxTokens');
      if (typeof config.maxHistoryMessages !== 'number') issues.push('Invalid maxHistoryMessages');

      // 检查数值范围
      if (config.temperature < 0 || config.temperature > 2) {
        issues.push('Temperature should be between 0 and 2');
      }
      if (config.maxTokens < 1 || config.maxTokens > 200000) {
        issues.push('MaxTokens should be between 1 and 200000');
      }

      return {
        isValid: issues.length === 0,
        issues,
        config
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [`Configuration error: ${error.message}`],
        config: null
      };
    }
  }
}

module.exports = AgentConfigManager;
