-- DEFAULT CATEGORIES FOR SYSTEM SEEDING
-- Default categories inserted globally for any household or initial setup

INSERT INTO public.categories (id, household_id, name, color, icon, is_active, is_default)
VALUES
  (gen_random_uuid(), NULL, 'Supermercado', '#16a34a', 'shopping-cart', true, true),
  (gen_random_uuid(), NULL, 'Comida', '#ea580c', 'utensils', true, true),
  (gen_random_uuid(), NULL, 'Salidas', '#d97706', 'coffee', true, true),
  (gen_random_uuid(), NULL, 'Combustible', '#dc2626', 'fuel', true, true),
  (gen_random_uuid(), NULL, 'Transporte', '#2563eb', 'bus', true, true),
  (gen_random_uuid(), NULL, 'Hogar', '#0284c7', 'home', true, true),
  (gen_random_uuid(), NULL, 'Servicios', '#4f46e5', 'zap', true, true),
  (gen_random_uuid(), NULL, 'Suscripciones', '#9333ea', 'tv', true, true),
  (gen_random_uuid(), NULL, 'Salud', '#059669', 'activity', true, true),
  (gen_random_uuid(), NULL, 'Farmacia', '#0d9488', 'pill', true, true),
  (gen_random_uuid(), NULL, 'Ropa', '#db2777', 'shirt', true, true),
  (gen_random_uuid(), NULL, 'Tecnología', '#6366f1', 'laptop', true, true),
  (gen_random_uuid(), NULL, 'Regalos', '#e11d48', 'gift', true, true),
  (gen_random_uuid(), NULL, 'Viajes', '#0891b2', 'plane', true, true),
  (gen_random_uuid(), NULL, 'Educación', '#65a30d', 'book-open', true, true),
  (gen_random_uuid(), NULL, 'Seguros', '#475569', 'shield', true, true),
  (gen_random_uuid(), NULL, 'Impuestos', '#b91c1c', 'file-text', true, true),
  (gen_random_uuid(), NULL, 'Mascotas', '#ca8a04', 'dog', true, true),
  (gen_random_uuid(), NULL, 'Otros', '#64748b', 'more-horizontal', true, true)
ON CONFLICT DO NOTHING;
