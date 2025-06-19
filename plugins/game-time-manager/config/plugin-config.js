// Game Time Manager Plugin Configuration

module.exports = {
  // Plugin metadata
  plugin: {
    name: 'Game Time Manager',
    version: '1.0.0',
    description: 'AI-driven game time management with parental controls',
    author: 'Screen Control Agents Framework'
  },

  // Game time quota settings
  gameTimeQuota: {
    dailyMinutes: 120,        // 2 hours per day
    weeklyMinutes: 600,       // 10 hours per week
    extendedBreakMinutes: 15, // Long break every hour
    shortBreakMinutes: 5,     // Short break every 30 minutes
    overtimeAllowanceMinutes: 30, // Extra time that can be earned

    // Time reset schedule
    resetSchedule: {
      daily: '00:00',     // Reset daily quota at midnight
      weekly: 'Sunday'    // Reset weekly quota on Sunday
    }
  },

  // Parental control settings
  parentalControls: {
    requirePassword: true,
    defaultPassword: 'parent123',
    lockdownMode: false,
    allowChildToExtendTime: false,
    maxPasswordAttempts: 3,
    lockoutDurationMinutes: 15,

    // Time restrictions
    restrictions: {
      allowedHours: {
        start: '08:00',
        end: '20:00'
      },
      blockedDays: [], // e.g., ['Sunday'] to block gaming on Sundays
      schoolModeEnabled: false,
      schoolModeSchedule: {
        monday: { start: '08:00', end: '15:00' },
        tuesday: { start: '08:00', end: '15:00' },
        wednesday: { start: '08:00', end: '15:00' },
        thursday: { start: '08:00', end: '15:00' },
        friday: { start: '08:00', end: '15:00' }
      }
    }
  },

  // Quiz system configuration
  quizSystem: {
    enabled: true,
    difficulty: 'medium', // easy, medium, hard
    timeRewardPerCorrectAnswer: 10, // minutes
    maxTimeRewardPerSession: 30,    // minutes
    questionTypes: ['math', 'logic', 'reading'],

    // Quiz settings by difficulty
    difficultySettings: {
      easy: {
        timeRewardPerCorrectAnswer: 15,
        questionsPerSession: 3
      },
      medium: {
        timeRewardPerCorrectAnswer: 10,
        questionsPerSession: 5
      },
      hard: {
        timeRewardPerCorrectAnswer: 5,
        questionsPerSession: 8
      }
    },

    // AMC 8 Math Competition settings
    amc8Settings: {
      enabled: true,
      timeLimit: 40, // minutes for entire test
      questionCount: 25,
      bonusTimeForFullCompletion: 60 // minutes
    }
  },

  // Supported games configuration
  games: {
    allowedGames: ['minecraft', 'bloxd', 'roblox'],

    gameExecutables: {
      minecraft: 'minecraft.exe',
      bloxd: 'chrome.exe',
      roblox: 'roblox.exe'
    },

    gameUrls: {
      bloxd: 'https://bloxd.io/',
      roblox: 'https://www.roblox.com/'
    },

    // Chrome-based games configuration
    chromeGames: {
      debugPort: 9222,
      enableDebugging: true,
      autoCloseOnTimeLimit: true
    },

    // Game-specific settings
    gameSettings: {
      minecraft: {
        allowMods: true,
        allowMultiplayer: true,
        enableParentalControls: true
      },
      bloxd: {
        allowedGameModes: ['survival', 'creative', 'peaceful'],
        blockInappropriateContent: true
      },
      roblox: {
        friendsOnly: true,
        chatEnabled: false,
        allowUserGeneratedContent: false
      }
    }
  },

  // System monitoring configuration
  monitoring: {
    checkIntervalSeconds: 60,
    enableProcessMonitoring: true,
    enableNetworkMonitoring: false,
    enableScreenshotMonitoring: false,

    // Performance monitoring
    performance: {
      maxCpuUsage: 80,        // Warn if CPU usage exceeds 80%
      maxMemoryUsage: 85,     // Warn if memory usage exceeds 85%
      monitorInterval: 300    // Check every 5 minutes
    },

    // Activity tracking
    activityTracking: {
      enabled: true,
      trackKeyboardActivity: false,
      trackMouseActivity: false,
      trackApplicationUsage: true,
      saveInterval: 600 // Save activity data every 10 minutes
    }
  },

  // Notification settings
  notifications: {
    enabled: true,
    methods: ['system_tray', 'popup'],

    // Notification triggers
    triggers: {
      gameStarted: true,
      gameStopped: true,
      timeWarning: true,      // Warn when 10 minutes left
      timeExpired: true,
      quizAvailable: true,
      parentalOverride: true,
      systemAlert: true
    },

    // Time-based warnings
    timeWarnings: {
      warningIntervals: [30, 15, 10, 5, 1], // Minutes before time expires
      finalWarningSound: true,
      persistentWarnings: true
    }
  },

  // Data storage and sync
  dataManagement: {
    localStorageEnabled: true,
    cloudSyncEnabled: false,

    // Local storage settings
    localStorage: {
      dataRetentionDays: 30,
      backupInterval: 'daily',
      maxBackupFiles: 7
    },

    // Cloud sync settings (Supabase)
    cloudSync: {
      enabled: false,
      syncInterval: 'hourly',
      syncTypes: ['usage_data', 'quiz_results', 'settings']
    }
  },

  // Security settings
  security: {
    enableEncryption: true,
    encryptionKey: null, // Will be generated on first run

    // Process protection
    processProtection: {
      preventTaskManagerAccess: false,
      preventProcessKill: false,
      requireElevatedPrivileges: false
    },

    // Network security
    networkSecurity: {
      blockSuspiciousUrls: true,
      enableParentalFiltering: true,
      allowedDomains: [
        'minecraft.net',
        'bloxd.io',
        'roblox.com',
        'khanacademy.org'
      ]
    }
  },

  // UI/UX settings
  userInterface: {
    theme: 'auto', // auto, light, dark
    language: 'en',
    showAdvancedOptions: false,

    // Child interface
    childInterface: {
      simplifiedUI: true,
      hideSystemInformation: true,
      enableFunAnimations: true,
      showProgressBars: true
    },

    // Parent interface
    parentInterface: {
      showDetailedReports: true,
      enableAdvancedControls: true,
      showSystemMetrics: true
    }
  },

  // Integration settings
  integrations: {
    // Steam integration
    steam: {
      enabled: false,
      trackSteamGames: false,
      steamPath: null
    },

    // Discord integration
    discord: {
      enabled: false,
      showGameActivity: false,
      parentNotifications: false
    },

    // Educational platforms
    educational: {
      khanAcademy: {
        enabled: false,
        timeBonus: 15 // Minutes of game time per 30 minutes of study
      },
      duolingo: {
        enabled: false,
        timeBonus: 10
      }
    }
  },

  // Development and debugging
  development: {
    enableDebugMode: false,
    verboseLogging: false,
    mockGameLauncher: false,
    simulateTimeUsage: false,

    // Testing settings
    testing: {
      reducedTimeQuotas: false,
      acceleratedTime: false,
      skipAuthentication: false
    }
  }
};
