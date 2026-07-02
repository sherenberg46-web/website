import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSaleCollectionByPath } from '@/lib/api';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';

export const revalidate = 120;

interface Props { params: { path: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const sc = await getSaleCollectionByPath(params.path);
    return { title: sc.title, description: sc.description ?? undefined };
  } catch {
    return { title: 'Распродажа' };
  }
}

export default async function SaleCollectionPage({ params }: Props) {
  let sc;
  try {
    sc = await getSaleCollectionByPath(params.path);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link href="/" className="hover:text-text-primary">Главная</Link>
        <span>/</span>
        <Link href="/sale" className="hover:text-text-primary">Распродажа</Link>
        <span>/</span>
        <span className="text-text-primary">{sc.title}</span>
      </nav>
      <ScrollReveal>
        <h1 className="text-4xl font-bold mb-4">{sc.title}</h1>
        {sc.description && <p className="text-text-secondary mb-8">{sc.description}</p>}
      </ScrollReveal>
      <ProductGrid products={sc.products ?? []} />
    </div>
  );
}
