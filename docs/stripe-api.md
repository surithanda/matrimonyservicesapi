# Stripe API Documentation

This document provides details on the available Stripe API endpoints in the Matrimony Services API.

## Base URL

All API endpoints are prefixed with `/api/stripe`.

## Authentication

All endpoints require authentication using a valid JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Customers

#### Create a Customer

Creates a new Stripe customer linked to an account.

- **URL**: `/customers`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "accountId": 123
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Customer created successfully",
    "data": {
      "id": "cus_XXX",
      "email": "customer@example.com",
      "name": "Customer Name",
      ...
    }
  }
  ```

#### Get a Customer

Retrieves a Stripe customer by ID.

- **URL**: `/customers/:customerId`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Customer found",
    "data": {
      "id": "cus_XXX",
      "email": "customer@example.com",
      "name": "Customer Name",
      ...
    }
  }
  ```

#### Update a Customer

Updates a Stripe customer.

- **URL**: `/customers/:customerId`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "+1234567890",
    "address": {
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94111",
      "country": "US"
    }
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Customer updated successfully",
    "data": {
      "id": "cus_XXX",
      "email": "updated@example.com",
      "name": "Updated Name",
      ...
    }
  }
  ```

#### Delete a Customer

Deletes a Stripe customer.

- **URL**: `/customers/:customerId`
- **Method**: `DELETE`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Customer deleted successfully",
    "data": {
      "id": "cus_XXX",
      "deleted": true
    }
  }
  ```

### Products

#### Create a Product

Creates a new Stripe product.

- **URL**: `/products`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Premium Membership",
    "description": "Premium membership with advanced features",
    "images": ["https://example.com/image.jpg"],
    "metadata": {
      "plan_type": "premium",
      "features": "all_inclusive"
    }
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": {
      "id": "prod_XXX",
      "name": "Premium Membership",
      "description": "Premium membership with advanced features",
      ...
    }
  }
  ```

#### List Products

Lists all products, optionally filtered by active status.

- **URL**: `/products?active=true`
- **Method**: `GET`
- **Query Parameters**:
  - `active`: (optional) Filter by active status (true/false)
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Products found",
    "data": [
      {
        "id": "prod_XXX",
        "name": "Premium Membership",
        "description": "Premium membership with advanced features",
        ...
      },
      ...
    ]
  }
  ```

#### Get a Product

Retrieves a Stripe product by ID.

- **URL**: `/products/:productId`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Product found",
    "data": {
      "id": "prod_XXX",
      "name": "Premium Membership",
      "description": "Premium membership with advanced features",
      ...
    }
  }
  ```

#### Update a Product

Updates a Stripe product.

- **URL**: `/products/:productId`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "name": "Updated Premium Membership",
    "description": "Updated description",
    "active": true
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "data": {
      "id": "prod_XXX",
      "name": "Updated Premium Membership",
      "description": "Updated description",
      ...
    }
  }
  ```

#### Delete a Product

Archives a Stripe product (sets active=false).

- **URL**: `/products/:productId`
- **Method**: `DELETE`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Product archived successfully",
    "data": {
      "id": "prod_XXX",
      "active": false,
      ...
    }
  }
  ```

#### Sync Products from Stripe

Synchronizes all products from Stripe to the local database.

- **URL**: `/products/sync`
- **Method**: `POST`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Synced 10 products successfully",
    "data": {
      "count": 10
    }
  }
  ```

### Subscriptions

#### Create a Subscription

Creates a new Stripe subscription.

- **URL**: `/subscriptions`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "customer": "cus_XXX",
    "items": [
      {
        "price": "price_XXX",
        "quantity": 1
      }
    ],
    "trial_period_days": 7,
    "payment_behavior": "default_incomplete",
    "payment_method": "pm_XXX",
    "promotion_code": "WELCOME10",
    "metadata": {
      "source": "web",
      "user_agent": "Chrome"
    }
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Subscription created successfully",
    "data": {
      "id": "sub_XXX",
      "customer": "cus_XXX",
      "status": "active",
      ...
    }
  }
  ```

#### Get a Subscription

Retrieves a Stripe subscription by ID.

- **URL**: `/subscriptions/:subscriptionId`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Subscription found",
    "data": {
      "id": "sub_XXX",
      "customer": "cus_XXX",
      "status": "active",
      ...
    }
  }
  ```

#### List Customer Subscriptions

Lists all subscriptions for a customer, optionally filtered by status.

- **URL**: `/customers/:customerId/subscriptions?status=active`
- **Method**: `GET`
- **Query Parameters**:
  - `status`: (optional) Filter by subscription status
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Subscriptions found",
    "data": [
      {
        "id": "sub_XXX",
        "customer": "cus_XXX",
        "status": "active",
        ...
      },
      ...
    ]
  }
  ```

#### Update a Subscription

Updates a Stripe subscription.

- **URL**: `/subscriptions/:subscriptionId`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "items": [
      {
        "id": "si_XXX",
        "price": "price_YYY"
      }
    ],
    "metadata": {
      "updated_by": "admin"
    }
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Subscription updated successfully",
    "data": {
      "id": "sub_XXX",
      "customer": "cus_XXX",
      "status": "active",
      ...
    }
  }
  ```

#### Cancel a Subscription

Cancels a Stripe subscription.

- **URL**: `/subscriptions/:subscriptionId/cancel`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "cancelAtPeriodEnd": true
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Subscription will be canceled at period end",
    "data": {
      "id": "sub_XXX",
      "cancel_at_period_end": true,
      ...
    }
  }
  ```

### Payments

#### Create a Payment Intent

Creates a new Stripe payment intent.

- **URL**: `/payment-intents`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "amount": 2000,
    "currency": "usd",
    "customer": "cus_XXX",
    "payment_method": "pm_XXX",
    "description": "Payment for Premium Membership",
    "receipt_email": "customer@example.com",
    "metadata": {
      "order_id": "12345"
    }
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Payment intent created successfully",
    "data": {
      "id": "pi_XXX",
      "amount": 2000,
      "currency": "usd",
      "status": "requires_confirmation",
      "client_secret": "pi_XXX_secret_YYY",
      ...
    }
  }
  ```

#### Get a Payment Intent

Retrieves a Stripe payment intent by ID.

- **URL**: `/payment-intents/:paymentIntentId`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Payment intent found",
    "data": {
      "id": "pi_XXX",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded",
      ...
    }
  }
  ```

#### Confirm a Payment Intent

Confirms a Stripe payment intent.

- **URL**: `/payment-intents/:paymentIntentId/confirm`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "paymentMethodId": "pm_XXX"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Payment intent confirmed successfully",
    "data": {
      "id": "pi_XXX",
      "status": "succeeded",
      ...
    }
  }
  ```

#### Cancel a Payment Intent

Cancels a Stripe payment intent.

- **URL**: `/payment-intents/:paymentIntentId/cancel`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "cancellationReason": "requested_by_customer"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Payment intent canceled successfully",
    "data": {
      "id": "pi_XXX",
      "status": "canceled",
      ...
    }
  }
  ```

#### Capture a Payment Intent

Captures a Stripe payment intent that was previously authorized.

- **URL**: `/payment-intents/:paymentIntentId/capture`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "amountToCapture": 1500
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Payment intent captured successfully",
    "data": {
      "id": "pi_XXX",
      "amount_received": 1500,
      "status": "succeeded",
      ...
    }
  }
  ```

#### Get a Charge

Retrieves a Stripe charge by ID.

- **URL**: `/charges/:chargeId`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Charge found",
    "data": {
      "id": "ch_XXX",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded",
      ...
    }
  }
  ```

#### List Customer Charges

Lists all charges for a customer.

- **URL**: `/customers/:customerId/charges`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Charges found",
    "data": [
      {
        "id": "ch_XXX",
        "amount": 2000,
        "currency": "usd",
        "status": "succeeded",
        ...
      },
      ...
    ]
  }
  ```

### Webhooks

#### Receive Stripe Webhook Events

Endpoint for receiving webhook events from Stripe.

- **URL**: `/webhook`
- **Method**: `POST`
- **Headers**:
  - `Stripe-Signature`: Signature provided by Stripe
- **Request Body**: Raw event payload from Stripe
- **Response**: 
  ```json
  {
    "received": true
  }
  ```

## Testing Mode

For testing purposes, set the `STRIPE_WEBHOOK_TESTING` environment variable to `true`. This will allow webhook events to be processed without strict signature verification.

## Error Responses

All endpoints return a standard error format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid parameters
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server-side error
