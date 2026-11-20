import ConfigureProductPage from '@/components/ConfigureProductPage';

export const dynamic = 'force-dynamic';

export default async function Page({params, searchParams}) {
  params = await params;
  searchParams = await searchParams;
  return <ConfigureProductPage slug={params.slug} designId={searchParams?.designId || null}/>;
}

