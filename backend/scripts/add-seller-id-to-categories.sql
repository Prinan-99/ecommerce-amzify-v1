-- Step 1: Add seller_id column if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seller_id UUID;

-- Step 2: Drop the old unique constraint on slug
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;

-- Step 3: Create new unique constraint on (slug, seller_id)
ALTER TABLE categories ADD CONSTRAINT categories_slug_seller_id_unique UNIQUE (slug, seller_id);

-- Step 4: Add index on seller_id
CREATE INDEX IF NOT EXISTS idx_categories_seller ON categories(seller_id);

-- Step 5: Add foreign key constraint to users table
ALTER TABLE categories ADD CONSTRAINT categories_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;
