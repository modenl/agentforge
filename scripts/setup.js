#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🎮 Children\'s Game Time Management System Setup\n');
  
  // Check if .env already exists
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    console.log('❌ .env file already exists. To prevent accidental overwrites, please:');
    console.log('1. Back up your current .env file: cp .env .env.backup');
    console.log('2. Remove the existing .env file: rm .env');
    console.log('3. Run this setup script again');
    console.log('\nSetup cancelled to protect your existing configuration.');
    rl.close();
    return;
  }

  console.log('Please provide the following configuration values:\n');

  // Collect configuration
  const config = {};
  
  config.OPENAI_API_KEY = await question('OpenAI API Key (required): ');
  if (!config.OPENAI_API_KEY) {
    console.log('❌ OpenAI API Key is required. Setup cancelled.');
    rl.close();
    return;
  }

  config.OPENAI_MODEL = await question('OpenAI Model (default: gpt-4-1106-preview): ') || 'gpt-4-1106-preview';
  
  console.log('\n📡 Supabase Configuration (optional - for cloud sync):');
  config.SUPABASE_URL = await question('Supabase URL (optional): ');
  config.SUPABASE_ANON_KEY = await question('Supabase Anon Key (optional): ');

  console.log('\n🔒 Security Configuration:');
  config.ENCRYPTION_KEY = await question('Encryption Key (32 characters, leave empty for auto-generate): ');
  if (!config.ENCRYPTION_KEY) {
    config.ENCRYPTION_KEY = require('crypto').randomBytes(16).toString('hex');
    console.log(`Generated encryption key: ${config.ENCRYPTION_KEY}`);
  }

  config.SESSION_SECRET = await question('Session Secret (leave empty for auto-generate): ');
  if (!config.SESSION_SECRET) {
    config.SESSION_SECRET = require('crypto').randomBytes(32).toString('hex');
    console.log(`Generated session secret: ${config.SESSION_SECRET}`);
  }

  console.log('\n⚙️ System Configuration:');
  const enableMonitoring = await question('Enable system monitoring? (Y/n): ');
  config.ENABLE_SYSTEM_MONITORING = enableMonitoring.toLowerCase() !== 'n';

  const debugMode = await question('Enable debug mode? (y/N): ');
  config.DEBUG_MODE = debugMode.toLowerCase() === 'y';

  // Generate .env file
  const envContent = `# OpenAI Configuration
OPENAI_API_KEY=${config.OPENAI_API_KEY}
OPENAI_MODEL=${config.OPENAI_MODEL}

# Supabase Configuration (Optional - for cloud sync)
SUPABASE_URL=${config.SUPABASE_URL || ''}
SUPABASE_ANON_KEY=${config.SUPABASE_ANON_KEY || ''}

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info

# Security Configuration
ENCRYPTION_KEY=${config.ENCRYPTION_KEY}
SESSION_SECRET=${config.SESSION_SECRET}

# System Monitoring (Windows specific)
ENABLE_SYSTEM_MONITORING=${config.ENABLE_SYSTEM_MONITORING}
MONITOR_INTERVAL_MS=5000

# Rate Limiting
API_RATE_LIMIT_PER_MINUTE=60
MCP_RATE_LIMIT_PER_MINUTE=100

# Development Settings
DEBUG_MODE=${config.DEBUG_MODE}
ENABLE_DEV_TOOLS=true
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Configuration saved to .env file');

  // Create assets directory if it doesn't exist
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
    console.log('📁 Created assets directory');
  }

  console.log('\n🚀 Setup complete! You can now run:');
  console.log('   npm run dev    - Start in development mode');
  console.log('   npm start      - Start the application');
  console.log('   npm test       - Run tests');
  console.log('   npm run lint   - Check code quality');
  
  console.log('\n📝 Next steps:');
  console.log('1. Add application icons to the assets/ directory');
  console.log('2. Customize game whitelist in src/config/config.js');
  console.log('3. Review time management settings');
  console.log('4. Test the application with different user roles');

  rl.close();
}

setup().catch(console.error); 