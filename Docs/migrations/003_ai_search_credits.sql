-- ============================================================
-- Migration 003: AI Search Credit System
-- Replaces monthly-quota model with persistent credit balance
-- ============================================================

-- ─── 1. Credit balance table ────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_search_credits (
    account_id        INT          NOT NULL PRIMARY KEY,
    credit_balance    INT          NOT NULL DEFAULT 0,
    free_credits_granted TINYINT(1) NOT NULL DEFAULT 0,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 2. Credit transaction log ──────────────────────────────
CREATE TABLE IF NOT EXISTS ai_search_credit_log (
    log_id            INT          AUTO_INCREMENT PRIMARY KEY,
    account_id        INT          NOT NULL,
    credits_change    INT          NOT NULL,           -- +50, +250, +1000, +10 (free grant), -1 (usage)
    transaction_type  ENUM('free_grant','purchase','usage') NOT NULL,
    description       VARCHAR(255) DEFAULT NULL,       -- e.g. "50 Search Pack - $10"
    stripe_session_id VARCHAR(255) DEFAULT NULL,       -- NULL for free_grant and usage
    balance_after     INT          NOT NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_credit_log_account (account_id),
    INDEX idx_credit_log_type    (transaction_type),
    INDEX idx_credit_log_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- ─── SP 1: Get credit balance ───────────────────────────────
DROP PROCEDURE IF EXISTS ai_search_get_credits;
DELIMITER $$
CREATE PROCEDURE ai_search_get_credits(
    IN p_account_id INT
)
BEGIN
    SELECT
        COALESCE(c.credit_balance, 0) AS credit_balance,
        COALESCE(c.free_credits_granted, 0) AS free_credits_granted
    FROM ai_search_credits c
    WHERE c.account_id = p_account_id;
END$$
DELIMITER ;

-- ─── SP 2: Grant free credits (10) — idempotent ────────────
DROP PROCEDURE IF EXISTS ai_search_grant_free_credits;
DELIMITER $$
CREATE PROCEDURE ai_search_grant_free_credits(
    IN p_account_id INT
)
BEGIN
    DECLARE v_already_granted TINYINT DEFAULT 0;
    DECLARE v_new_balance INT DEFAULT 0;

    -- Check if already granted
    SELECT free_credits_granted INTO v_already_granted
    FROM ai_search_credits
    WHERE account_id = p_account_id;

    IF v_already_granted = 1 THEN
        -- Already granted, return current balance
        SELECT credit_balance, 0 AS credits_added, 'already_granted' AS status
        FROM ai_search_credits
        WHERE account_id = p_account_id;
    ELSE
        -- Insert or update
        INSERT INTO ai_search_credits (account_id, credit_balance, free_credits_granted)
        VALUES (p_account_id, 10, 1)
        ON DUPLICATE KEY UPDATE
            credit_balance = credit_balance + 10,
            free_credits_granted = 1;

        SELECT credit_balance INTO v_new_balance
        FROM ai_search_credits
        WHERE account_id = p_account_id;

        -- Log the transaction
        INSERT INTO ai_search_credit_log
            (account_id, credits_change, transaction_type, description, balance_after)
        VALUES
            (p_account_id, 10, 'free_grant', '10 Free AI Search Credits (Membership Bonus)', v_new_balance);

        SELECT v_new_balance AS credit_balance, 10 AS credits_added, 'granted' AS status;
    END IF;
END$$
DELIMITER ;

-- ─── SP 3: Add purchased credits ────────────────────────────
DROP PROCEDURE IF EXISTS ai_search_add_credits;
DELIMITER $$
CREATE PROCEDURE ai_search_add_credits(
    IN p_account_id       INT,
    IN p_credits          INT,
    IN p_description      VARCHAR(255),
    IN p_stripe_session_id VARCHAR(255)
)
BEGIN
    DECLARE v_new_balance INT DEFAULT 0;

    -- Upsert credit balance
    INSERT INTO ai_search_credits (account_id, credit_balance)
    VALUES (p_account_id, p_credits)
    ON DUPLICATE KEY UPDATE
        credit_balance = credit_balance + p_credits;

    SELECT credit_balance INTO v_new_balance
    FROM ai_search_credits
    WHERE account_id = p_account_id;

    -- Log the transaction
    INSERT INTO ai_search_credit_log
        (account_id, credits_change, transaction_type, description, stripe_session_id, balance_after)
    VALUES
        (p_account_id, p_credits, 'purchase', p_description, p_stripe_session_id, v_new_balance);

    SELECT v_new_balance AS credit_balance, p_credits AS credits_added, 'success' AS status;
END$$
DELIMITER ;

-- ─── SP 4: Use 1 credit (deduct on search) ─────────────────
DROP PROCEDURE IF EXISTS ai_search_use_credit;
DELIMITER $$
CREATE PROCEDURE ai_search_use_credit(
    IN p_account_id INT
)
BEGIN
    DECLARE v_current_balance INT DEFAULT 0;
    DECLARE v_new_balance INT DEFAULT 0;

    -- Get current balance
    SELECT COALESCE(credit_balance, 0) INTO v_current_balance
    FROM ai_search_credits
    WHERE account_id = p_account_id;

    IF v_current_balance <= 0 THEN
        SELECT 0 AS credit_balance, 'insufficient' AS status;
    ELSE
        -- Deduct 1 credit
        UPDATE ai_search_credits
        SET credit_balance = credit_balance - 1
        WHERE account_id = p_account_id;

        SET v_new_balance = v_current_balance - 1;

        -- Log the usage
        INSERT INTO ai_search_credit_log
            (account_id, credits_change, transaction_type, description, balance_after)
        VALUES
            (p_account_id, -1, 'usage', 'AI Search query', v_new_balance);

        SELECT v_new_balance AS credit_balance, 'success' AS status;
    END IF;
END$$
DELIMITER ;
