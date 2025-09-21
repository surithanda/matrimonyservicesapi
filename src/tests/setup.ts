// Global Jest setup file
import '@types/jest';

// Mock dependencies
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    getConnection: jest.fn().mockResolvedValue({
      execute: jest.fn().mockResolvedValue([[]]),
      release: jest.fn()
    })
  }
}));

// Mock Stripe
jest.mock('../../config/stripe', () => ({
  __esModule: true,
  default: {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn()
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn()
    },
    products: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      list: jest.fn()
    },
    prices: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      list: jest.fn()
    },
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
      capture: jest.fn()
    },
    charges: {
      retrieve: jest.fn(),
      list: jest.fn()
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  }
}));
