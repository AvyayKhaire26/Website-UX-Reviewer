// Set test environment
process.env.NODE_ENV = 'test';

jest.mock('../src/config/database.config', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    getRepository: jest.fn(),
  },
}));