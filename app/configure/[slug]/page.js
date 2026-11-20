import ProductStudio from '@/components/ProductStudio';
import { normalizeProduct } from '@/lib/normalizeProduct';
import { getProductBySlug } from '@/redux/api/productsApi';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page({params, searchParams}) {
  params = await params;
  searchParams = await searchParams;
  try {
    const product = normalizeProduct(await getProductBySlug(params.slug));
    if (!product.id || !product.slug) notFound();
    return <ProductStudio product={product} designId={searchParams?.designId || null}/>;
  } catch (error) {
    if (error.status === 404) notFound();
    throw error;
  }
}

