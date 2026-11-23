import { notFound } from 'next/navigation';
import CustomerDashboard from '@/components/CustomerDashboard';
import AuthGuard from '@/components/AuthGuard';

const dashboardSections = new Set([
  'overview',
  'profile',
  'orders',
  'proofs',
  'designs',
  'reorder',
  'invoices',
]);

export default async function DashboardSectionPage({ params }) {
  const { section } = await params;

  if (!dashboardSections.has(section)) notFound();

  return (
    <AuthGuard>
      <CustomerDashboard section={section} />
    </AuthGuard>
  );
}
