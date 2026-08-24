import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { guides } from '../guides-data';

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guides.find((x) => x.slug === params.slug);
  if (!g) return {};
  return {
    title: g.metaTitle,
    description: g.metaDesc,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: g.metaTitle, description: g.metaDesc, type: 'article' },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = guides.find((x) => x.slug === params.slug);
  if (!g) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: g.breadcrumbJsonLd }} />
      {g.faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: g.faqJsonLd }} />
      )}
      <Link
        href="/guides"
        className="text-sm text-text-muted transition-colors hover:text-accent"
      >
        ← Все гайды
      </Link>
      <article className="guide-content mt-4 text-text-primary">
        <h1 className="text-3xl font-extrabold">{g.h1}</h1>
        <div className="mt-6" dangerouslySetInnerHTML={{ __html: g.bodyHtml }} />
      </article>
    </div>
  );
}
