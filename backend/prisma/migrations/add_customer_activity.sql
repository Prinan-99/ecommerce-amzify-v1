-- Create customer_activity table for tracking customer behavior
CREATE TABLE IF NOT EXISTS customer_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'product_view', 'cart_abandon', 'purchase', 'login'
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    metadata JSONB, -- Store additional data like viewed products, cart items, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_customer_activity_customer (customer_id),
    INDEX idx_customer_activity_type (activity_type),
    INDEX idx_customer_activity_created (created_at)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role_created ON users(role, created_at DESC);

COMMENT ON TABLE customer_activity IS 'Tracks customer behavior including viewed products, abandoned carts, and activity timeline';
COMMENT ON COLUMN customer_activity.activity_type IS 'Type of activity: product_view, cart_abandon, purchase, login, category_browse';
COMMENT ON COLUMN customer_activity.metadata IS 'Additional JSON data specific to the activity type';
