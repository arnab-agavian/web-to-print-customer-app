import CartPage from '@/components/ApiCartPage';
import AuthGuard from '@/components/AuthGuard';

export default function Page(){return <AuthGuard><CartPage/></AuthGuard>}
