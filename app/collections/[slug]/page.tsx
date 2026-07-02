import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollectionBySlug } from '@/lib/api';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';

export const revalidate = 300;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const col = await getCollectionBySlug(params.slug);
    return { title: col.title, description: col.description ?? undefined };
  } catch {
    return { title: 'Подборка' };
  }
}

export default async function CollectionPage({ params }: Props) {
  let collection;
  try {
    collection = await getCollectionBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link href="/" className="hover:text-text-primary">Главная</Link>
        <span>/</span>
        <span className="text-text-primary">{collection.title}</span>
      </nav>
      <ScrollReveal>
        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
        {collection.description && (
          <p className="text-text-secondary mb-8 max-w-2xl">{collection.description}</p>
        )}
      </ScrollReveal>
      <ProductGrid products={collection.products ?? []} />
    </div>
  );
}
