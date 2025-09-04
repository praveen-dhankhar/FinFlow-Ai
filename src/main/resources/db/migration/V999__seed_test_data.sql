-- Seed users
INSERT INTO users (username, email, password_hash)
VALUES ('demo', 'demo@example.com', 'hashed-password-123');

-- Seed categories for demo user
INSERT INTO categories (name, type, color, user_id)
SELECT 'Groceries', 'EXPENSE', '#43a047', id FROM users WHERE username = 'demo';

INSERT INTO categories (name, type, color, user_id)
SELECT 'Salary', 'INCOME', '#1e88e5', id FROM users WHERE username = 'demo';

-- Seed financial data
INSERT INTO financial_data (user_id, date, amount, category, description, type)
SELECT id, CURRENT_DATE, 100.00, 'Groceries', 'Weekly grocery shopping', 'EXPENSE' FROM users WHERE username = 'demo';

INSERT INTO financial_data (user_id, date, amount, category, description, type)
SELECT id, CURRENT_DATE, 2000.00, 'Salary', 'Monthly salary', 'INCOME' FROM users WHERE username = 'demo';

-- Seed forecast
INSERT INTO forecasts (user_id, forecast_date, predicted_amount, confidence_score)
SELECT id, CURRENT_DATE + 30, 1800.00, 85.0 FROM users WHERE username = 'demo';

