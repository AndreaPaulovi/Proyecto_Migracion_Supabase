
-- Extensión necesaria para generar UUID.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Usuarios
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role text NOT NULL DEFAULT 'customer',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Direcciones
CREATE TABLE IF NOT EXISTS public.addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    region text NOT NULL,
    province text NOT NULL,
    city text NOT NULL,
    barangay text NOT NULL,
    address_line text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tiendas
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    region text NOT NULL,
    province text NOT NULL,
    city text NOT NULL,
    barangay text NOT NULL,
    address_line text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Envíos
CREATE TABLE IF NOT EXISTS public.shipping (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    base_fee_cents int NOT NULL CHECK (base_fee_cents >= 0),
    fee_per_km_cents int NOT NULL CHECK (fee_per_km_cents >= 0)
);

-- 5. Categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Subcategorías
CREATE TABLE IF NOT EXISTS public.subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (category_id, name),
    UNIQUE (category_id, slug)
);

-- 7. Productos
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL,
    name text NOT NULL UNIQUE,
    description text NOT NULL,
    price_cents int NOT NULL CHECK (price_cents >= 0),
    currency text NOT NULL DEFAULT 'PHP',
    weight_grams int NOT NULL CHECK (weight_grams >= 0),
    thumbnail_url text,
    thumbnail_public_id text,
    is_active boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Inventario
CREATE TABLE IF NOT EXISTS public.inventory (
    product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    quantity int NOT NULL CHECK (quantity >= 0),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Carritos
CREATE TABLE IF NOT EXISTS public.carts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Productos en carritos
CREATE TABLE IF NOT EXISTS public.cart_items (
    cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity int NOT NULL CHECK (quantity >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (cart_id, product_id)
);

-- 11. Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending',
    subtotal_cents int NOT NULL CHECK (subtotal_cents >= 0),
    tax_cents int NOT NULL CHECK (tax_cents >= 0),
    shipping_fee_cents int NOT NULL CHECK (shipping_fee_cents >= 0),
    shipping_distance_meters int NOT NULL CHECK (shipping_distance_meters >= 0),
    total_cents int NOT NULL CHECK (total_cents >= 0),
    paid_at timestamptz,
    processed_at timestamptz,
    shipped_at timestamptz,
    delivered_at timestamptz,
    cancelled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. Detalles de pedidos
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    product_thumbnail_url text,
    quantity int NOT NULL CHECK (quantity >= 0),
    unit_price_cents int NOT NULL CHECK (unit_price_cents >= 0),
    subtotal_cents int NOT NULL CHECK (subtotal_cents >= 0)
);

-- 13. Pagos
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    amount_cents int NOT NULL CHECK (amount_cents >= 0),
    status text NOT NULL DEFAULT 'pending',
    provider text NOT NULL DEFAULT 'mock',
    transaction_id text NOT NULL UNIQUE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_addresses_user_id
    ON public.addresses (user_id);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id
    ON public.subcategories (category_id);

CREATE INDEX IF NOT EXISTS idx_products_subcategory_id
    ON public.products (subcategory_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
    ON public.cart_items (product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
    ON public.orders (user_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
    ON public.payments (order_id);

CREATE UNIQUE INDEX IF NOT EXISTS one_store_only
    ON public.stores ((true));

CREATE UNIQUE INDEX IF NOT EXISTS one_shipping_only
    ON public.shipping ((true));
