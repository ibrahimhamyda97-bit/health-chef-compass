
CREATE TABLE public.cake_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cake_listing_id uuid NOT NULL REFERENCES public.cake_listings(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text,
  message text,
  servings integer,
  event_date date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cake_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can create an order (public contact form)
CREATE POLICY "Anyone can create cake orders" ON public.cake_orders
  FOR INSERT TO public WITH CHECK (true);

-- Sellers can view orders for their own listings
CREATE POLICY "Sellers can view their orders" ON public.cake_orders
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.cake_listings cl
      WHERE cl.id = cake_listing_id AND cl.user_id = auth.uid()
    )
  );

-- Sellers can update order status
CREATE POLICY "Sellers can update their orders" ON public.cake_orders
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.cake_listings cl
      WHERE cl.id = cake_listing_id AND cl.user_id = auth.uid()
    )
  );
