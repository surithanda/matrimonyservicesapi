// Jest setup file for Stripe tests

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock mysql2/promise
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn().mockReturnValue({
    getConnection: jest.fn().mockResolvedValue({
      execute: jest.fn().mockResolvedValue([[]]),
      release: jest.fn()
    })
  })
}));

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
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
  }));
});
