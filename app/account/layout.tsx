import type { Metadata } from 'next';

// Личный кабинет — страница конкретного человека, поисковикам она не нужна
export const metadata: Metadata = {
  title: 'Личный кабинет',
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
