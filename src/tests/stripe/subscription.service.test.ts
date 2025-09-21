import '../setup';
import { StripeSubscriptionService } from '../../services/stripe/subscription.service';
import { StripeSubscriptionRepository } from '../../repositories/stripe/subscription.repository';
import { StripeCustomerRepository } from '../../repositories/stripe/customer.repository';
import { StripePriceRepository } from '../../repositories/stripe/price.repository';
import stripe from '../../config/stripe';

// Mock dependencies
jest.mock('../../repositories/stripe/subscription.repository');
jest.mock('../../repositories/stripe/customer.repository');
jest.mock('../../repositories/stripe/price.repository');
jest.mock('../../config/stripe', () => ({
  __esModule: true,
  default: {
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn()
    },
    customers: {
      retrieve: jest.fn()
    },
    prices: {
      retrieve: jest.fn()
    }
  }
}));

describe('StripeSubscriptionService', () => {
  let stripeSubscriptionService: StripeSubscriptionService;
  let mockSubscriptionRepository: jest.Mocked<StripeSubscriptionRepository>;
  let mockCustomerRepository: jest.Mocked<StripeCustomerRepository>;
  let mockPriceRepository: jest.Mocked<StripePriceRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionRepository = new StripeSubscriptionRepository() as jest.Mocked<StripeSubscriptionRepository>;
    mockCustomerRepository = new StripeCustomerRepository() as jest.Mocked<StripeCustomerRepository>;
    mockPriceRepository = new StripePriceRepository() as jest.Mocked<StripePriceRepository>;
    
    // @ts-ignore - mock implementation
    StripeSubscriptionRepository.mockImplementation(() => mockSubscriptionRepository);
    // @ts-ignore - mock implementation
    StripeCustomerRepository.mockImplementation(() => mockCustomerRepository);
    // @ts-ignore - mock implementation
    StripePriceRepository.mockImplementation(() => mockPriceRepository);
    
    stripeSubscriptionService = new StripeSubscriptionService();
  });

  describe('createSubscription', () => {
    it('should create a subscription successfully', async () => {
      // Mock customer repository
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com'
      };
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      
      // Mock price repository
      const mockPrice = {
        id: 'price_test123',
        product: 'prod_test123',
        unit_amount: 1000,
        currency: 'usd'
      };
      mockPriceRepository.findById.mockResolvedValue(mockPrice);
      
      // Mock Stripe API
      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_test123'
              }
            }
          ]
        }
      };
      (stripe.subscriptions.create as jest.Mock).mockResolvedValue(mockSubscription);
      
      // Subscription data
      const subscriptionData = {
        customer: 'cus_test123',
        items: [
          {
            price: 'price_test123'
          }
        ]
      };
      
      // Execute test
      const result = await stripeSubscriptionService.createSubscription(subscriptionData);
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription created successfully');
      expect(result.data).toBe(mockSubscription);
      expect(mockCustomerRepository.findById).toHaveBeenCalledWith('cus_test123');
      expect(mockPriceRepository.findById).toHaveBeenCalledWith('price_test123');
      expect(stripe.subscriptions.create).toHaveBeenCalledWith(expect.objectContaining({
        customer: 'cus_test123',
        items: [{ price: 'price_test123' }]
      }));
      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(mockSubscription, expect.anything());
    });

    it('should return error if customer not found', async () => {
      // Mock customer repository - no customer found
      mockCustomerRepository.findById.mockResolvedValue(null);
      
      // Mock Stripe API - error
      (stripe.customers.retrieve as jest.Mock).mockRejectedValue(new Error('Customer not found'));
      
      // Subscription data
      const subscriptionData = {
        customer: 'cus_nonexistent',
        items: [
          {
            price: 'price_test123'
          }
        ]
      };
      
      // Execute test
      const result = await stripeSubscriptionService.createSubscription(subscriptionData);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toBe('Customer not found');
      expect(stripe.subscriptions.create).not.toHaveBeenCalled();
    });

    it('should return error if price not found', async () => {
      // Mock customer repository
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com'
      };
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      
      // Mock price repository - no price found
      mockPriceRepository.findById.mockResolvedValue(null);
      
      // Mock Stripe API - error
      (stripe.prices.retrieve as jest.Mock).mockRejectedValue(new Error('Price not found'));
      
      // Subscription data
      const subscriptionData = {
        customer: 'cus_test123',
        items: [
          {
            price: 'price_nonexistent'
          }
        ]
      };
      
      // Execute test
      const result = await stripeSubscriptionService.createSubscription(subscriptionData);
      
      // Assertions
      expect(result.success).toBe(false);
      expect(result.message).toBe('Price price_nonexistent not found');
      expect(stripe.subscriptions.create).not.toHaveBeenCalled();
    });
  });

  describe('getSubscription', () => {
    it('should get subscription from database if exists', async () => {
      // Mock subscription repository
      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active'
      };
      mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);
      
      // Execute test
      const result = await stripeSubscriptionService.getSubscription('sub_test123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription found');
      expect(result.data).toBe(mockSubscription);
      expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
    });

    it('should get subscription from Stripe if not in database', async () => {
      // Mock subscription repository - no subscription found
      mockSubscriptionRepository.findById.mockResolvedValue(null);
      
      // Mock Stripe API
      const mockStripeSubscription = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active'
      };
      (stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(mockStripeSubscription);
      
      // Execute test
      const result = await stripeSubscriptionService.getSubscription('sub_test123');
      
      // Assertions
      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription retrieved from Stripe');
      expect(result.data).toBe(mockStripeSubscription);
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_test123', expect.anything());
      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(mockStripeSubscription);
    });
  });
});
