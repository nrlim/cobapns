-- Migrate obsolete SubscriptionTier enum values before schema push
-- PRO → ELITE mapping (closest equivalent), PREMIUM → MASTER
UPDATE users SET "subscriptionTier" = 'FREE' WHERE "subscriptionTier" IN ('PRO', 'PREMIUM');
