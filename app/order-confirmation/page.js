import OrderConfirmation from '@/components/OrderConfirmation';
import AuthGuard from '@/components/AuthGuard';

export default function Page(){return <AuthGuard><OrderConfirmation/></AuthGuard>}
