'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductStudio from './ProductStudio';
import { LoadingScreen } from './LoadingState';
import { fetchProductBySlug } from '@/redux/slices/productsSlice';

export default function ConfigureProductPage({ slug, designId = null }) {
  const dispatch = useDispatch();
  const { current, detailError, detailStatus, requestedSlug } = useSelector((state) => state.products);
  const ready = detailStatus === 'succeeded' && requestedSlug === slug && current?.slug === slug;

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [dispatch, slug]);

  if (!ready && (detailStatus === 'idle' || detailStatus === 'loading' || requestedSlug !== slug)) {
    return <LoadingScreen label="Loading product configuration…" />;
  }

  if (!ready) {
    return (
      <main className="loading-screen configure-load-error" role="alert">
        <span className="loading-brand">DH</span>
        <h1>Product unavailable.</h1>
        <p>{detailError?.message || 'The product could not be loaded.'}</p>
        <div>
          <button className="button button-primary" type="button" onClick={() => dispatch(fetchProductBySlug(slug))}>Try again</button>
          <Link className="button button-lime" href="/#products">Browse products</Link>
        </div>
      </main>
    );
  }

  return <ProductStudio product={current} designId={designId} />;
}
