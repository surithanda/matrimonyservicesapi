import '../setup';
import { StripeCustomerService } from '../../services/stripe/customer.service';
import { AccountRepository } from '../../repositories/account.repository';
import { StripeCustomerRepository } from '../../repositories/stripe/customer.repository';
import stripe from '../../config/stripe';

// Mock dependencies
jest.mock('../../repositories/account.repository');
jest.mock('../../repositories/stripe/customer.repository');
jest.mock('../../config/stripe', () => ({
  __esModule: true,
  default: {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn()
    }
  }
}));

describe('StripeCustomerService', () => {
  let stripeCustomerService: StripeCustomerService;
  let mockAccountRepository: jest.Mocked<AccountRepository>;
  let mockStripeCustomerRepository: jest.Mocked<StripeCustomerRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountRepository = new AccountRepository() as jest.Mocked<AccountRepository>;
    mockStripeCustomerRepository = new StripeCustomerRepository() as jest.Mocked<StripeCustomerRepository>;
    
    // @ts-ignore - mock implementation
    AccountRepository.mockImplementation(() => mockAccountRepository);
    // @ts-ignore - mock implementation
    StripeCustomerRepository.mockImplementation(() => mockStripeCustomerRepository);
    
    stripeCustomerService = new StripeCustomerService();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      // Mock account repository
      const mockAccount = {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        primary_phone: '+1234567890',
        address_line1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US'
      };
      mockAccountRepository.findByAccountCode.mockResolvedValue(mockAccount);
      
      // Mock customer repository
      mockStripeCustomerRepository.findByAccountId.mockResolvedValue(null);
      
      // Mock Stripe API
      const mockStripeCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        name: 'Test User'
      };
      (stripe.customers.create as jest.Mock).mockResolvedValue(mockStripeCustomer);
      
      // Execute test
      const result = await stripeCustomerService.createCustomer(123);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toBe('Customer created successfully');
      expect(result.data).toBe(mockStripeCustomer);
      expect(mockAccountRepository.findByAccountCode).toHaveBeenCalledWith("123");
      expect(stripe.customers.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User',
        metadata: { account_id: '123' }
      }));
      expect(mockStripeCustomerRepository.create).toHaveBeenCalledWith(mockStripeCustomer, expect.anything());
    });

    it('should return existing customer if already exists', async () => {
      // Mock account repository
      const mockAccount = {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      };
      mockAccountRepository.findByAccountCode.mockResolvedValue(mockAccount);
      
      // Mock customer repository - customer already exists
      const existingCustomer = {
        id: 'cus_existing123',
        email: 'test@example.com'
      };
      mockStripeCustomerRepository.findByAccountId.mockResolvedValue(existingCustomer);
      
      // Execute test
      const result = await stripeCustomerService.createCustomer(123);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toBe('Customer already exists');
      expect(result.data).toBe(existingCustomer);
      expect(stripe.customers.create).not.toHaveBeenCalled();
    });

    it('should throw error if account not found', async () => {
      // Mock account repository - no account found
      mockAccountRepository.findByAccountCode.mockResolvedValue(null);
      
      // Execute test & assertions
      await expect(stripeCustomerService.createCustomer(123)).rejects.toThrow('Account not found');
      expect(stripe.customers.create).not.toHaveBeenCalled();
    });
  });

  describe('getCustomer', () => {
    it('should get customer from database if exists', async () => {
      // Mock customer repository
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com'
      };
      mockStripeCustomerRepository.findById.mockResolvedValue(mockCustomer);
      
      // Execute test
      const result = await stripeCustomerService.getCustomer('cus_test123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toBe('Customer found');
      expect(result.data).toBe(mockCustomer);
      expect(stripe.customers.retrieve).not.toHaveBeenCalled();
    });

    it('should get customer from Stripe if not in database', async () => {
      // Mock customer repository - no customer found
      mockStripeCustomerRepository.findById.mockResolvedValue(null);
      
      // Mock Stripe API
      const mockStripeCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        deleted: false
      };
      (stripe.customers.retrieve as jest.Mock).mockResolvedValue(mockStripeCustomer);
      
      // Execute test
      const result = await stripeCustomerService.getCustomer('cus_test123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toBe('Customer retrieved from Stripe');
      expect(result.data).toBe(mockStripeCustomer);
      expect(stripe.customers.retrieve).toHaveBeenCalledWith('cus_test123');
      expect(mockStripeCustomerRepository.create).toHaveBeenCalledWith(mockStripeCustomer);
    });

    it('should return error if customer not found in Stripe', async () => {
      // Mock customer repository - no customer found
      mockStripeCustomerRepository.findById.mockResolvedValue(null);
      
      // Mock Stripe API - error
      (stripe.customers.retrieve as jest.Mock).mockRejectedValue({
        code: 'resource_missing'
      });
      
      // Execute test
      const result = await stripeCustomerService.getCustomer('cus_nonexistent');
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toBe('Customer not found in Stripe');
    });
  });
});
