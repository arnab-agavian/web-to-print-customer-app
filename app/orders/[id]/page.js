import OrderDetailsPage from '@/components/OrderDetailsPage';
import AuthGuard from '@/components/AuthGuard';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  params = await params;
  return <AuthGuard><OrderDetailsPage orderId={params.id} /></AuthGuard>;
}
