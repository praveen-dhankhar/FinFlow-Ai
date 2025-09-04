-- Fix schema conflicts between existing data and new JPA entities

-- Drop existing data that conflicts with new structure
DELETE FROM financial_data WHERE category NOT IN (
    'SALARY', 'BONUS', 'FREELANCE', 'INVESTMENT_RETURN', 'RENTAL_INCOME', 'OTHER_INCOME',
    'HOUSING', 'FOOD', 'TRANSPORTATION', 'HEALTHCARE', 'ENTERTAINMENT', 'EDUCATION', 
    'SHOPPING', 'UTILITIES', 'INSURANCE', 'TAXES', 'DEBT_PAYMENT', 'SAVINGS', 
    'INVESTMENT', 'OTHER_EXPENSE'
);

-- Update existing data to match new enum values
UPDATE financial_data SET category = 'FOOD' WHERE category = 'Groceries';
UPDATE financial_data SET category = 'ENTERTAINMENT' WHERE category = 'Movies';
UPDATE financial_data SET category = 'TRANSPORTATION' WHERE category = 'Gas';

-- Fix confidence score values that are too large
UPDATE forecasts SET confidence_score = 0.85 WHERE confidence_score > 1.0;

-- Add default values for new required fields
UPDATE forecasts SET model_name = 'default_model' WHERE model_name IS NULL;

-- Make audit fields nullable to allow for proper auditing
ALTER TABLE users ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE users ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE financial_data ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE financial_data ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE forecasts ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE forecasts ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE accounts ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE accounts ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE transactions ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE transactions ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE budgets ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE budgets ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE financial_goals ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE financial_goals ALTER COLUMN updated_at DROP NOT NULL;
