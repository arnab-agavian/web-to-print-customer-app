import CustomerDashboard from '@/components/CustomerDashboard';
import AuthGuard from '@/components/AuthGuard';

export default function Page(){return <AuthGuard><CustomerDashboard/></AuthGuard>}

