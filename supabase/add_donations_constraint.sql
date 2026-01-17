-- Add CHECK constraint to donations table to ensure total_items is positive
ALTER TABLE donations 
ADD CONSTRAINT donations_total_items_positive 
CHECK (total_items > 0);
