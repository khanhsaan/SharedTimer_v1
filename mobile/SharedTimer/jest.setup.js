// Mock console to reduce noise in tests (optional)
global.console = {
    ...console,
    // Uncomment to suppress console output in tests
    // error: jest.fn(),
    // warn: jest.fn(),
    // log: jest.fn(),
};

// Set up React Native globals
global.__DEV__ = true;

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '14.0',
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

// Set up React Native bridge config
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
};

// Add any global test setup here
// For example, custom matchers or global mocks