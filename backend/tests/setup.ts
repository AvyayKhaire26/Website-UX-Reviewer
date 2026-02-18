process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';

// Mock database BEFORE any module loads
jest.mock('../src/config/database.config', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    getRepository: jest.fn(),
  },
}));

// Prevent process.exit from killing Jest workers
jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined) => {
  // swallow exit in test environment
  return undefined as never;
});
