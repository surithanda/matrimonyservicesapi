-- Create profile_search_preference table
-- This table stores user search preferences by profile ID

CREATE TABLE IF NOT EXISTS `profile_search_preference` (
  `preference_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL,
  `min_age` int(11) DEFAULT NULL,
  `max_age` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `location_preference` varchar(255) DEFAULT NULL,
  `distance_preference` int(11) DEFAULT NULL,
  `created_user` varchar(100) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`preference_id`),
  UNIQUE KEY `unique_profile_preference` (`profile_id`),
  KEY `idx_profile_id` (`profile_id`),
  KEY `idx_created_user` (`created_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint if profiles table exists
-- ALTER TABLE `profile_search_preference` 
-- ADD CONSTRAINT `fk_profile_search_preference_profile` 
-- FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`profile_id`) 
-- ON DELETE CASCADE ON UPDATE CASCADE;
