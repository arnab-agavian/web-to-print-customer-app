import CheckoutPage from '@/components/CheckoutPage';
import AuthGuard from '@/components/AuthGuard';

export default function Page(){return <AuthGuard><CheckoutPage/></AuthGuard>}
