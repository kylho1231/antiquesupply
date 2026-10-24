-- Private supplier media. Only the authenticated server endpoint can write.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('supplier-photos', 'supplier-photos', false, 8388608, ARRAY['image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 8388608,
allowed_mime_types = ARRAY['image/webp'];

CREATE TABLE public.product_photos (
  id uuid PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  object_path text NOT NULL UNIQUE,
  alt text NOT NULL CHECK (char_length(alt) BETWEEN 3 AND 300),
  bytes integer NOT NULL CHECK (bytes BETWEEN 1 AND 8388608),
  rights_confirmed_at timestamptz NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_photos FROM anon, authenticated;
GRANT ALL ON public.product_photos TO service_role;
-- No storage.objects policies are created. Service-role writes are validated by
-- the API after JWT verification and organization membership/role checks.

CREATE FUNCTION public.check_photo_quota() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE owning_org uuid;
BEGIN
  SELECT organization_id INTO owning_org FROM products WHERE id = NEW.product_id FOR UPDATE;
  IF owning_org IS DISTINCT FROM NEW.organization_id THEN RAISE EXCEPTION 'Organization mismatch'; END IF;
  IF NEW.object_path <> NEW.organization_id::text || '/' || NEW.product_id::text || '/' || NEW.id::text || '.webp'
    THEN RAISE EXCEPTION 'Invalid storage path'; END IF;
  -- Six published plus up to six replacements awaiting an atomic gallery save.
  IF (SELECT count(*) FROM product_photos WHERE product_id = NEW.product_id) >= 12
    THEN RAISE EXCEPTION 'Photo quota reached'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER enforce_photo_quota BEFORE INSERT ON public.product_photos
FOR EACH ROW EXECUTE FUNCTION public.check_photo_quota();

CREATE FUNCTION public.publish_product_photos(target_product uuid, ordered_ids uuid[])
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM 1 FROM products WHERE id = target_product FOR UPDATE;
  IF cardinality(ordered_ids) > 6 OR
     cardinality(ordered_ids) <> (SELECT count(DISTINCT item) FROM unnest(ordered_ids) item) OR
     cardinality(ordered_ids) <> (SELECT count(*) FROM product_photos WHERE product_id = target_product AND id = ANY(ordered_ids))
    THEN RAISE EXCEPTION 'Invalid gallery'; END IF;
  UPDATE product_photos SET is_published = false WHERE product_id = target_product;
  UPDATE product_photos SET is_published = true, display_order = array_position(ordered_ids, id) - 1
    WHERE product_id = target_product AND id = ANY(ordered_ids);
  DELETE FROM product_images WHERE product_id = target_product;
  INSERT INTO product_images(product_id, image_url, display_order, is_primary)
    SELECT target_product, '/api/v1/media/' || id, display_order, display_order = 0
    FROM product_photos WHERE product_id = target_product AND is_published;
END; $$;
REVOKE ALL ON FUNCTION public.publish_product_photos(uuid, uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_product_photos(uuid, uuid[]) TO service_role;

CREATE FUNCTION public.remove_photo_reference() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  DELETE FROM product_images WHERE image_url = '/api/v1/media/' || OLD.id;
  RETURN OLD;
END; $$;
CREATE TRIGGER remove_photo_reference AFTER DELETE ON public.product_photos
FOR EACH ROW EXECUTE FUNCTION public.remove_photo_reference();
