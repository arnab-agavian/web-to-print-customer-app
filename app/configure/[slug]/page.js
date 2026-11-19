import CustomerStudio from '@/components/CustomerStudio';
import { products } from '@/lib/data';
import { notFound } from 'next/navigation';

export function generateStaticParams(){ return products.map(({slug}) => ({slug})); }
export default async function Page({params}) {
  params = await params;
  const product = products.find((item) => item.slug === params.slug);
  if (!product) notFound();
  return <CustomerStudio product={product}/>;
}

