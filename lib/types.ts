export interface GameEdition {
  id: number;
  name: string;
  price_uah: number | null;
  price_try: number | null;
  price_inr: number | null;
  price_pln: number | null;
  price_byn?: number | null;
  is_default: boolean;
  sort_order: number;
}

// Ответ /products/{id}/editions (GameEditionOut в backend) — НЕ путать
// с GameEdition (вложенные editions в Product)
export interface CatalogEdition {
  id: number;
  edition_name: string;
  price_uah: number | null;
  price_try: number | null;
  price_byn: number | null;
  price_byn_tr: number | null;
  old_price_uah: number | null;
  old_price_try: number | null;
  discount_pct: number;
  platform: string | null;
  ps_store_url: string | null;
  region: string;
  is_free: boolean;
  linked_product_id: number | null;
}

export interface DlcItem {
  id: number;
  title: string;
  image_url: string | null;
  price_byn: number | null;
  price_uah: number | null;
  price_try: number | null;
  description?: string;
  product_type?: string;
}

export interface Product {
  id: number;
  category_id: number;
  title: string;
  description: string;
  image_url: string;
  price_uah: number | null;
  price_try: number | null;
  price_inr: number | null;
  price_pln: number | null;
  price_byn: number | null;
  price_byn_tr: number | null;
  platform: string;
  rating: number;
  is_featured: boolean;
  discount_pct: number;
  discount_until: string | null;
  release_date: string | null;
  product_type: 'game' | 'subscription' | 'topup' | 'key';
  is_preorder: boolean;
  store_price: number | null;
  cost_byn: number | null;
  task_type: string | null;
  region: string;
  genre: string | null;
  requires_ps_plus: boolean;
  editions: GameEdition[];
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_ua: string;
  link_tr: string;
  link_url: string;
  gradient: string;
  sort_order: number;
  collection_slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

export interface Collection {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  products?: Product[];
}

export interface SaleCollection {
  id: number;
  title: string;
  path: string;
  description: string | null;
  image_url: string | null;
  products?: Product[];
}

export interface CartItem {
  product_id: number;
  edition_id: number | null;
  edition_name: string | null;
  qty: number;
  title: string;
  image_url: string;
  price_byn: number;
  original_price_byn: number | null;
  discount_pct: number;
  product_type: Product['product_type'];
}

export interface WebOrderPayload {
  items: Array<{
    product_id: number;
    edition_id?: number | null;
    qty: number;
  }>;
  name: string;
  contact: string;
  comment?: string;
  region?: string;
}

export interface ProductFilters {
  category_id?: number;
  search?: string;
  product_type?: string;
  sort?: string;
  genre?: string;
  platform?: string;
  limit?: number;
  offset?: number;
  is_preorder?: boolean;
  task_type?: string;
  region?: string;
  section?: string;
  price_min?: number;
  price_max?: number;
  discount_min?: number;
}
