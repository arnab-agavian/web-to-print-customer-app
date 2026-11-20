'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Minus, PackageOpen, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import { LoadingOverlay } from './LoadingState';
import {
  fetchCart,
  removeCartItem,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
  updateCartItem,
} from '@/redux/slices/cartSlice';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(value || 0);

export default function ApiCartPage() {
  const dispatch = useDispatch();
  const { error, items, mutationStatus, status } = useSelector((state) => state.cart);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const total = useSelector(selectCartTotal);
  const updating = mutationStatus === 'loading';

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  return (
    <main className="journey-page">
      <div className="journey-dark">
        <Header />
        <div className="journey-hero"><span>YOUR PROJECTS</span><h1>Review your cart.</h1><p>Check the print specs and artwork before moving to delivery and payment.</p></div>
      </div>
      <div className="cart-layout">
        {updating && <LoadingOverlay label="Updating your cart…" />}
        {status === 'loading' ? (
          <section className="empty-state"><h2>Loading your cart…</h2></section>
        ) : error && items.length === 0 ? (
          <section className="empty-state"><PackageOpen /><h2>We couldn’t load your cart.</h2><p>{error}</p><button className="journey-button primary" type="button" onClick={() => dispatch(fetchCart())}>Try again</button></section>
        ) : items.length === 0 ? (
          <section className="empty-state"><PackageOpen /><h2>Your cart is ready for a bright idea.</h2><p>Choose a product, configure it and create your artwork in the studio.</p><Link className="journey-button primary" href="/#products">Browse products</Link></section>
        ) : (
          <>
            <section className="cart-list">
              {error && <div className="studio-error" role="alert">{error}</div>}
              {items.map((item) => {
                const configuration = item.configuration || {};
                const productName = item.product?.name || item.productName || 'Print project';
                const productSlug = item.product?.slug || item.productSlug || '';
                const designId = configuration.designId;
                return (
                  <article className="cart-item" key={item.id || item.key}>
                    <div className="cart-art" style={{ background: configuration.accent || item.color || '#dfe3df' }}>
                      {configuration.previewUrl ? <img src={configuration.previewUrl} alt={`${productName} preview`} /> : <strong>{configuration.designText || 'ART'}</strong>}
                      <small>{productName}</small>
                    </div>
                    <div className="cart-copy">
                      <span>PRINT PROJECT</span><h2>{productName}</h2><p>{item.width} × {item.height} mm · {item.material} finish</p>
                      <small>{configuration.designName || configuration.artworkName || configuration.designText || 'Validated design'}</small>
                      <div className="cart-actions">
                        <div>
                          <button type="button" aria-label="Decrease quantity" disabled={updating || !item.id} onClick={() => dispatch(updateCartItem({ id: item.id, changes: { quantity: Math.max(1, item.quantity - 10) } }))}><Minus /></button>
                          <b>{item.quantity}</b>
                          <button type="button" aria-label="Increase quantity" disabled={updating || !item.id} onClick={() => dispatch(updateCartItem({ id: item.id, changes: { quantity: item.quantity + 10 } }))}><Plus /></button>
                        </div>
                        {productSlug && <Link href={designId
                          ? `/configure/${productSlug}?designId=${encodeURIComponent(designId)}`
                          : `/configure/${productSlug}`}>Modify design</Link>}
                        <button type="button" className="remove" disabled={updating || !item.id} onClick={() => dispatch(removeCartItem(item.id))}><Trash2 />Remove</button>
                      </div>
                    </div>
                    <div className="cart-price"><b>{money(item.price?.total ?? item.total)}</b><small>{money(item.price?.unitPrice ?? item.unit)} each</small></div>
                  </article>
                );
              })}
            </section>
            <aside className="order-summary"><span>ORDER SUMMARY</span><h2>Ready for checkout?</h2><dl><div><dt>Print subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>GST</dt><dd>{money(tax)}</dd></div><div className="total"><dt>Total</dt><dd>{money(total)}</dd></div></dl><Link className="journey-button primary" href="/checkout">Continue to checkout</Link><p><ShieldCheck />Your order is only produced after proof approval.</p></aside>
          </>
        )}
      </div>
    </main>
  );
}
