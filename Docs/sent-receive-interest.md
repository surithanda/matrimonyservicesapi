Send and Receive Interest feature implementation

## Requirement Flow

### Core Process:
1. **User A** sends interest to **User B** → Status: `pending`
2. Intimation should go **User B** and **Partner Admin B**
3. **Partner Admin B** reviews the interest
4. **Partner Admin B** can:
   - **Approve** → Status: `approved` (personal info revealed, communication enabled)
   - **Reject** → Status: `rejected` (interest declined, no personal info shared)
5. **User B** can respond to the interest (approve/reject)
6. Both **Partner Admin B** and **User B** have to approve for the request to be approved
7. Once both **Partner Admin B** and **User B** approves, a notification and profile view access for 30 days is sent to **User A** and **Partner Admin A**
9. **Partner Admin B**, **User B** and **User A** can withdraw interests at any time and Status is marked `withdrawn`

### Privacy Controls:
- **Initial State**: No personal information visible between users
- **After Approval**: Contact details and personal information become visible
- **Partner Control**: Admin approval required before any personal data exchange

### Business Model:
- **Revenue Source**: Commission when marriages occur through platform connections
- **Partner Benefit**: Partners earn commission from successful matches
- **Platform Control**: Direct communication blocked until partner approval

### User Actions:
- Send interest to other users
- View sent interests (with status)
- View received interests (with status)
- Withdraw pending interests
- View complete interest history/timeline

### Partner Admin Actions:
- Review pending interests
- Approve/reject interests after verification with profile owner
- View all interests for their profiles
- Bulk operations for efficiency
- Track commission opportunities 

I want you to reveiew all these requirements and suggest any improvements or changes.

## Implementation Plan

### 1. Database Schema Design

#### Tables Required:
```sql
-- Interest requests table
CREATE TABLE interest_requests (
    interest_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
    message TEXT,
    partner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_by INT NULL, -- partner_admin_id who approved
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    
    FOREIGN KEY (sender_id) REFERENCES user_profiles(user_id),
    FOREIGN KEY (receiver_id) REFERENCES user_profiles(user_id),
    FOREIGN KEY (partner_id) REFERENCES partners(partner_id),
    FOREIGN KEY (approved_by) REFERENCES partner_admin_users(partner_admin_id),
    
    UNIQUE KEY unique_pending_interest (sender_id, receiver_id, status),
    INDEX idx_receiver_status (receiver_id, status),
    INDEX idx_sender_status (sender_id, status),
    INDEX idx_partner_status (partner_id, status)
);

-- Interest history/log table
CREATE TABLE interest_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    interest_id INT NOT NULL,
    action ENUM('sent', 'approved', 'rejected', 'withdrawn', 'viewed') NOT NULL,
    performed_by INT NOT NULL, -- user_id or partner_admin_id
    performed_by_role ENUM('user', 'partner_admin') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    
    FOREIGN KEY (interest_id) REFERENCES interest_requests(interest_id),
    INDEX idx_interest_action (interest_id, action_date)
);

-- Commission tracking table
CREATE TABLE marriage_commissions (
    commission_id INT PRIMARY KEY AUTO_INCREMENT,
    interest_id INT NOT NULL,
    partner_id INT NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    marriage_date DATE NULL,
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (interest_id) REFERENCES interest_requests(interest_id),
    FOREIGN KEY (partner_id) REFERENCES partners(partner_id),
    INDEX idx_partner_status (partner_id, commission_status)
);
```

### 2. Stored Procedures

#### Core Interest Operations:
```sql
-- Send interest request
DELIMITER //
CREATE PROCEDURE send_interest_request(
    IN p_sender_id INT,
    IN p_receiver_id INT,
    IN p_message TEXT,
    IN p_partner_id INT
)
BEGIN
    DECLARE v_interest_count INT;
    
    -- Check if pending interest already exists
    SELECT COUNT(*) INTO v_interest_count
    FROM interest_requests 
    WHERE sender_id = p_sender_id 
    AND receiver_id = p_receiver_id 
    AND status = 'pending';
    
    IF v_interest_count = 0 THEN
        INSERT INTO interest_requests (sender_id, receiver_id, message, partner_id)
        VALUES (p_sender_id, p_receiver_id, p_message, p_partner_id);
        
        -- Log the action
        INSERT INTO interest_history (interest_id, action, performed_by, performed_by_role)
        VALUES (LAST_INSERT_ID(), 'sent', p_sender_id, 'user');
        
        SELECT 'SUCCESS' as status, 'Interest sent successfully' as message, LAST_INSERT_ID() as interest_id;
    ELSE
        SELECT 'ERROR' as status, 'Interest already sent and pending' as message, 0 as interest_id;
    END IF;
END //
DELIMITER ;

-- Get received interests for a user
DELIMITER //
CREATE PROCEDURE get_received_interests(
    IN p_user_id INT,
    IN p_status VARCHAR(20) DEFAULT NULL,
    IN p_offset INT DEFAULT 0,
    IN p_limit INT DEFAULT 10
)
BEGIN
    SELECT 
        ir.interest_id,
        ir.sender_id,
        ir.status,
        ir.message,
        ir.created_at,
        up.first_name as sender_name,
        up.age as sender_age,
        up.religion as sender_religion,
        up.caste as sender_caste,
        up.location as sender_location,
        up.profile_photo_url
    FROM interest_requests ir
    JOIN user_profiles up ON ir.sender_id = up.user_id
    WHERE ir.receiver_id = p_user_id
    AND (p_status IS NULL OR ir.status = p_status)
    ORDER BY ir.created_at DESC
    LIMIT p_offset, p_limit;
END //
DELIMITER ;

-- Get sent interests for a user
DELIMITER //
CREATE PROCEDURE get_sent_interests(
    IN p_user_id INT,
    IN p_status VARCHAR(20) DEFAULT NULL,
    IN p_offset INT DEFAULT 0,
    IN p_limit INT DEFAULT 10
)
BEGIN
    SELECT 
        ir.interest_id,
        ir.receiver_id,
        ir.status,
        ir.message,
        ir.created_at,
        up.first_name as receiver_name,
        up.age as receiver_age,
        up.religion as receiver_religion,
        up.caste as receiver_caste,
        up.location as receiver_location,
        up.profile_photo_url
    FROM interest_requests ir
    JOIN user_profiles up ON ir.receiver_id = up.user_id
    WHERE ir.sender_id = p_user_id
    AND (p_status IS NULL OR ir.status = p_status)
    ORDER BY ir.created_at DESC
    LIMIT p_offset, p_limit;
END //
DELIMITER ;

-- Partner admin approve/reject interest
DELIMITER //
CREATE PROCEDURE update_interest_status(
    IN p_interest_id INT,
    IN p_new_status VARCHAR(20),
    IN p_partner_admin_id INT,
    IN p_rejection_reason TEXT DEFAULT NULL
)
BEGIN
    DECLARE v_partner_id INT;
    
    -- Get partner_id for validation
    SELECT partner_id INTO v_partner_id 
    FROM interest_requests 
    WHERE interest_id = p_interest_id;
    
    -- Update interest status
    UPDATE interest_requests 
    SET status = p_new_status,
        approved_by = p_partner_admin_id,
        approved_at = IF(p_new_status IN ('approved', 'rejected'), NOW(), NULL),
        rejection_reason = IF(p_new_status = 'rejected', p_rejection_reason, NULL),
        updated_at = NOW()
    WHERE interest_id = p_interest_id;
    
    -- Log the action
    INSERT INTO interest_history (interest_id, action, performed_by, performed_by_role, notes)
    VALUES (p_interest_id, p_new_status, p_partner_admin_id, 'partner_admin', p_rejection_reason);
    
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;
```

### 3. API Endpoints

#### User-facing APIs:
```
POST /api/interest/send
- Body: { receiver_id, message }
- Auth: User JWT
- Response: Interest status and ID

GET /api/interest/received
- Query: status (optional), page, limit
- Auth: User JWT
- Response: Paginated received interests list

GET /api/interest/sent
- Query: status (optional), page, limit
- Auth: User JWT
- Response: Paginated sent interests list

POST /api/interest/withdraw/:interestId
- Auth: User JWT (sender only)
- Response: Updated status

GET /api/interest/history/:interestId
- Auth: User JWT (sender/receiver only)
- Response: Complete interest timeline
```

#### Partner Admin APIs:
```
GET /api/admin/interests/pending
- Query: page, limit
- Auth: Partner Admin JWT
- Response: Pending interests for partner's profiles

POST /api/admin/interests/:interestId/approve
- Auth: Partner Admin JWT
- Body: { notes (optional) }
- Response: Updated interest status

POST /api/admin/interests/:interestId/reject
- Auth: Partner Admin JWT
- Body: { reason }
- Response: Updated interest status

GET /api/admin/interests/all
- Query: status, dateFrom, dateTo, page, limit
- Auth: Partner Admin JWT
- Response: Filtered interests list
```

### 4. Implementation Components

#### Backend Files:
```
src/
├── controllers/
│   ├── interest.controller.ts          # User interest operations
│   └── adminInterest.controller.ts      # Partner admin operations
├── services/
│   ├── interest.service.ts              # Business logic
│   ├── notification.service.ts          # Email/SMS notifications
│   └── commission.service.ts            # Commission tracking
├── repositories/
│   ├── interest.repository.ts           # Database operations
│   └── commission.repository.ts        # Commission operations
├── middleware/
│   └── interestValidation.middleware.ts # Input validation
├── interfaces/
│   └── interest.interface.ts            # TypeScript interfaces
└── routes/
    ├── interest.routes.ts               # User routes
    └── adminInterest.routes.ts          # Admin routes
```

#### Frontend Components:
```
src/components/interest/
├── SendInterestModal.tsx               # Send interest form
├── InterestList.tsx                    # Common list component
├── InterestCard.tsx                    # Individual interest card
├── InterestDetail.tsx                  # Full interest details
├── InterestHistory.tsx                 # Timeline view
└── AdminInterestPanel.tsx              # Partner admin interface
```

### 5. Key Features & Improvements

#### Privacy & Security:
- **Profile Masking**: Hide contact details until approval
- **Partner Verification**: Admin approval required before revealing personal info
- **Audit Trail**: Complete history of all actions
- **Rate Limiting**: Prevent spam interest requests

#### Business Logic:
- **Duplicate Prevention**: Block multiple pending interests
- **Auto-expiry**: Pending interests expire after 30 days
- **Commission Tracking**: Automatic tracking for successful marriages
- **Notification System**: Email/SMS alerts for status changes

#### User Experience:
- **Real-time Updates**: WebSocket notifications for new interests
- **Mobile Responsive**: Optimized for mobile devices
- **Search & Filter**: Advanced filtering of interest history
- **Quick Actions**: Bulk approve/reject for partners

### 6. Development Phases

#### Phase 1: Core Functionality (2 weeks)
- Database schema and stored procedures
- Basic send/receive interest APIs
- Simple frontend components
- Unit and integration tests

#### Phase 2: Admin Panel (1 week)
- Partner admin approval interface
- Bulk operations
- Advanced filtering and search
- Admin notifications

#### Phase 3: Enhanced Features (1 week)
- Real-time notifications
- Commission tracking
- Advanced privacy controls
- Mobile optimizations

#### Phase 4: Analytics & Reports (1 week)
- Interest statistics dashboard
- Partner performance metrics
- Revenue tracking reports
- User engagement analytics

### 7. Testing Strategy

#### Unit Tests:
- All stored procedures
- API endpoints
- Business logic services
- Validation middleware

#### Integration Tests:
- End-to-end interest flow
- Partner admin approval process
- Notification delivery
- Commission calculation

#### Performance Tests:
- Load testing for high-volume scenarios
- Database query optimization
- API response time benchmarks

### 8. Success Metrics

#### User Engagement:
- Number of interests sent/received
- Acceptance/rejection rates
- Response time analysis

#### Business Impact:
- Partner commission revenue
- Profile activation rates
- User retention improvements

#### Technical Performance:
- API response times < 200ms
- 99.9% uptime
- Zero data loss incidents

This comprehensive plan ensures the interest feature meets all business requirements while maintaining security, privacy, and scalability standards.
