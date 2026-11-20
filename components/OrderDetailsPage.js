'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock3,
  CreditCard,
  FileCheck2,
  MapPin,
  PackageCheck,
  ReceiptText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import { LoadingScreen } from './LoadingState';
import ProofPreviewModal from './ProofPreviewModal';
import { fetchOrderById } from '@/redux/slices/ordersSlice';

const money = (value, currency = 'INR') => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency,
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const formatDate = (value, includeTime = false) => value
  ? new Intl.DateTimeFormat('en-IN', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(new Date(value))
  : 'Not available';

const titleCase = (value = '') => String(value)
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const proofPreviewValue = (proof = {}) => proof.previewUrl
  || proof.publicUrl
  || proof.previewPath
  || proof.previewpath
  || proof.preview_path
  || '';

export default function OrderDetailsPage({ orderId }) {
  const dispatch = useDispatch();
  const [previewModal, setPreviewModal] = useState(null);
  const { current: order, currentError, currentStatus, requestedOrderId } = useSelector((state) => state.orders);
  const ready = currentStatus === 'succeeded' && requestedOrderId === orderId && order?.id === orderId;

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  if (requestedOrderId !== orderId || currentStatus === 'idle' || currentStatus === 'loading') {
    return <LoadingScreen label="Loading order details…" />;
  }

  if (!ready) {
    return (
      <main className="loading-screen configure-load-error" role="alert">
        <span className="loading-brand">DH</span>
        <h1>Order unavailable.</h1>
        <p>{currentError || 'The order details could not be loaded.'}</p>
        <div><button className="button button-primary" type="button" onClick={() => dispatch(fetchOrderById(orderId))}>Try again</button><Link className="button button-lime" href="/dashboard">Back to dashboard</Link></div>
      </main>
    );
  }

  const address = order.configuration?.deliveryAddress || {};
  const paymentMethod = order.configuration?.paymentMethod || 'Not specified';
  const paymentStatus = order.configuration?.paymentStatus || (order.paymentReference ? 'paid' : 'pending');
  const items = Array.isArray(order.items) ? order.items : [];
  const proofs = Array.isArray(order.proofs) ? order.proofs : [];
  const events = Array.isArray(order.events) ? order.events : [];

  return (
    <main className="order-detail-page">
      <div className="journey-dark compact">
        <Header />
        <div className="order-detail-hero">
          <Link href="/dashboard"><ArrowLeft />Back to order history</Link>
          <div>
            <span>ORDER DETAILS</span>
            <h1>{order.order_number}</h1>
            <p>Placed {formatDate(order.created_at, true)} · {items.length} item{items.length === 1 ? '' : 's'}</p>
          </div>
          <em className={`order-detail-status ${order.status}`}>{titleCase(order.status)}</em>
        </div>
      </div>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <section className="order-detail-card">
            <div className="order-detail-heading"><span>ORDER ITEMS</span><h2>What you ordered.</h2></div>
            <div className="order-detail-items">
              {items.map((item, index) => {
                const productName = item.product?.name || item.productName || `Item ${index + 1}`;
                const productSlug = item.product?.slug || item.productSlug;
                const design = item.design || {};
                const designData = design.designData || item.configuration?.designData || {};
                const layers = Array.isArray(designData.layers) ? designData.layers.filter((layer) => layer.value) : [];
                const designId = item.designId || item.configuration?.designId || design.id;
                const quantity = Number(item.quantity || 0);
                const unitPrice = Number(item.unitPrice || item.unit_price || 0);

                return (
                  <article key={item.id || index}>
                    <div className="order-item-mark" style={{ background: item.configuration?.accent || '#7868ff' }}><strong>{item.configuration?.designText || productName.slice(0, 2).toUpperCase()}</strong><small>{String(index + 1).padStart(2, '0')}</small></div>
                    <div className="order-item-copy">
                      <div><span>{productName}</span><h3>{design.name || item.configuration?.designName || 'Custom print design'}</h3></div>
                      <dl>
                        <div><dt>Size</dt><dd>{item.widthMm || item.width} × {item.heightMm || item.height} mm</dd></div>
                        <div><dt>Material</dt><dd>{item.material || 'Standard'}</dd></div>
                        <div><dt>Quantity</dt><dd>{quantity} units</dd></div>
                        <div><dt>Unit price</dt><dd>{money(unitPrice, order.currency)}</dd></div>
                      </dl>
                      {layers.length > 0 && <div className="order-personalisation"><b>Personalisation</b>{layers.map((layer) => <span key={layer.key || layer.label}><small>{layer.label || layer.key}</small><strong>{layer.type === 'image' || layer.type === 'file' ? 'Artwork uploaded' : layer.value}</strong></span>)}</div>}
                      {productSlug && designId && <Link href={`/configure/${productSlug}?designId=${encodeURIComponent(designId)}`}>Open saved design</Link>}
                    </div>
                    <strong className="order-item-total">{money(unitPrice * quantity, order.currency)}</strong>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="order-detail-card">
            <div className="order-detail-heading"><span>ORDER ACTIVITY</span><h2>Progress timeline.</h2></div>
            <div className="order-timeline">
              {events.length > 0 ? events.map((event) => <div key={event.id}><span><Check /></span><div><b>{titleCase(event.eventType || event.type)}</b><small>{formatDate(event.createdAt || event.created_at, true)}</small>{event.metadata && <p>{event.metadata.itemCount ? `${event.metadata.itemCount} items` : ''}{event.metadata.total ? ` · ${money(event.metadata.total, order.currency)}` : ''}</p>}</div></div>) : <div><span><Clock3 /></span><div><b>Order placed</b><small>{formatDate(order.created_at, true)}</small></div></div>}
            </div>
          </section>
        </div>

        <aside className="order-detail-aside">
          <section className="order-detail-card order-total-card">
            <ReceiptText />
            <span>ORDER TOTAL</span>
            <dl><div><dt>Subtotal</dt><dd>{money(order.subtotal, order.currency)}</dd></div><div><dt>Tax</dt><dd>{money(order.tax, order.currency)}</dd></div><div className="total"><dt>Total</dt><dd>{money(order.total, order.currency)}</dd></div></dl>
          </section>

          <section className="order-detail-card detail-info-card">
            <MapPin />
            <div><span>DELIVERY ADDRESS</span><h3>{address.label || 'Delivery address'}</h3></div>
            <p><b>{address.recipientName}</b><br />{address.addressLine1}{address.addressLine2 ? <><br />{address.addressLine2}</> : null}<br />{address.city}, {address.state} {address.postalCode}<br />{address.countryCode}<br />{address.phone}</p>
          </section>

          <section className="order-detail-card detail-info-card">
            <CreditCard />
            <div><span>PAYMENT</span><h3>{paymentMethod === 'cod' ? 'Cash on delivery' : titleCase(paymentMethod)}</h3></div>
            <p>Status: <b>{titleCase(paymentStatus)}</b>{order.paymentReference && <><br />Reference: {order.paymentReference}</>}</p>
          </section>

          <section className="order-detail-card detail-info-card">
            <PackageCheck />
            <div><span>PRODUCTION</span><h3>{order.productionReady ? 'Ready for production' : 'Awaiting production'}</h3></div>
            <p>Order status: <b>{titleCase(order.status)}</b><br />Proof status: <b>{titleCase(order.proof_status)}</b>{order.dueAt && <><br />Due: {formatDate(order.dueAt)}</>}</p>
          </section>

          {proofs.length > 0 && (
            <section className="order-detail-card detail-info-card">
              <FileCheck2 />
              <div><span>PROOFS</span><h3>{proofs.length} proof{proofs.length === 1 ? '' : 's'}</h3></div>
              <div className="order-proof-list">
                {proofs.map((proof) => {
                  const preview = proofPreviewValue(proof);
                  const isUrl = /^https?:\/\//i.test(preview);
                  const previewTitle = `${order.order_number} proof version ${proof.version}`;
                  return (
                    <div className="order-proof-entry" key={proof.id}>
                      {isUrl && <button type="button" className="order-proof-thumbnail" onClick={() => setPreviewModal({ preview, title: previewTitle })} aria-label={`Open ${previewTitle}`}><img src={preview} alt={previewTitle} /></button>}
                      <p><b>Version {proof.version} · {titleCase(proof.status)}</b>{proof.notes && <><br />{proof.notes}</>}<br /><small>{formatDate(proof.createdAt || proof.created_at, true)}</small></p>
                      {isUrl ? <button type="button" className="order-proof-open" onClick={() => setPreviewModal({ preview, title: previewTitle })}>Open preview</button> : preview ? <code title={preview}>{preview}</code> : null}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="order-reference"><span>Order ID</span><code>{order.id}</code>{order.customerId && <><span>Customer ID</span><code>{order.customerId}</code></>}{order.reorderedFromId && <><span>Reordered from</span><code>{order.reorderedFromId}</code></>}</section>
        </aside>
      </div>
      <ProofPreviewModal preview={previewModal?.preview} title={previewModal?.title} onClose={() => setPreviewModal(null)} />
    </main>
  );
}
