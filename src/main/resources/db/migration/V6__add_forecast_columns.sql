-- Add missing columns to forecasts table
ALTER TABLE forecasts ADD COLUMN model_name VARCHAR(100);
ALTER TABLE forecasts ADD COLUMN model_version VARCHAR(50);
ALTER TABLE forecasts ADD COLUMN prediction_context TEXT;

-- Update existing records with default values
UPDATE forecasts SET 
    model_name = 'Default Model',
    model_version = '1.0.0',
    prediction_context = 'Default prediction context'
WHERE model_name IS NULL;

-- Make model_name NOT NULL after setting default values
ALTER TABLE forecasts ALTER COLUMN model_name SET NOT NULL;

-- Add indexes for the new columns
CREATE INDEX idx_forecasts_model ON forecasts (model_name);
CREATE INDEX idx_forecasts_model_version ON forecasts (model_version);
