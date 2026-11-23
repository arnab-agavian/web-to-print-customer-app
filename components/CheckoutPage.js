"use client";

import { Banknote, Check, CreditCard, LockKeyhole, MapPin, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { ButtonLoader, LoadingState } from "./LoadingState";
import {
  clearServerCart,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
} from "@/redux/slices/cartSlice";
import { submitCheckout } from "@/redux/slices/checkoutSlice";
import { fetchCustomerAddresses } from "@/redux/slices/dashboardSlice";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("demo-card");
  const items = useSelector((state) => state.cart.items);
  const { status, error } = useSelector((state) => state.checkout);
  const { addresses, addressError, addressStatus } = useSelector((state) => state.dashboard);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const total = useSelector(selectCartTotal);
  const loading = status === "loading";
  const addressLoading = addressStatus === "idle" || addressStatus === "loading";
  const selectedAddress = addresses.find((address) => (address.id || address._id) === selectedAddressId)
    || addresses.find((address) => address.isDefault)
    || addresses[0];

  useEffect(() => {
    if (addressStatus === "idle") dispatch(fetchCustomerAddresses());
  }, [addressStatus, dispatch]);

  useEffect(() => {
    if (!addresses.length) return;
    const selectedStillExists = addresses.some((address) => (address.id || address._id) === selectedAddressId);
    if (!selectedStillExists) {
      const preferred = addresses.find((address) => address.isDefault) || addresses[0];
      setSelectedAddressId(preferred.id || preferred._id);
    }
  }, [addresses, selectedAddressId]);

  async function placeOrder(event) {
    event.preventDefault();
    if (!selectedAddress) return;
    const deliveryAddress = {
      id: selectedAddress.id || selectedAddress._id,
      label: selectedAddress.label,
      recipientName: selectedAddress.recipientName,
      phone: selectedAddress.phone,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2 || null,
      city: selectedAddress.city,
      state: selectedAddress.state,
      postalCode: selectedAddress.postalCode,
      countryCode: selectedAddress.countryCode,
      isDefault: Boolean(selectedAddress.isDefault),
    };
    const orderItems = items.map((item) => ({
      productSlug: item.product?.slug || item.productSlug,
      width: Number(item.width),
      height: Number(item.height),
      quantity: Number(item.quantity),
      material: item.material || "standard",
      materialMultiplier: Number(item.materialMultiplier || 1),
      ...(item.configuration?.designId ? { designId: item.configuration.designId } : {}),
      configuration: item.configuration || {},
    }));
    const result = await dispatch(
      submitCheckout({
        amount: total,
        paymentMethod,
        order: {
          items: orderItems,
          configuration: {
            delivery: "standard",
            deliveryAddressId: deliveryAddress.id,
            deliveryAddress,
            paymentMethod,
            paymentStatus: paymentMethod === "cod" ? "pay_on_delivery" : "paid",
          },
        },
      }),
    );
    if (submitCheckout.fulfilled.match(result)) {
      await dispatch(clearServerCart());
      router.push("/order-confirmation");
    }
  }
  return (
    <main className="journey-page">
      <div className="journey-dark compact">
        <Header />
        <div className="journey-hero">
          <span>SECURE CHECKOUT</span>
          <h1>Confirm the details.</h1>
          <p>Choose secure card payment or pay with cash when your order is delivered.</p>
        </div>
      </div>
      <form
        className="checkout-layout"
        onSubmit={placeOrder}
        aria-busy={loading}
      >
        <div className="checkout-forms">
          <section className="checkout-card">
            <div className="checkout-heading">
              <span>DELIVERY</span>
              <h2>Where should it go?</h2>
            </div>
            {addressLoading ? (
              <LoadingState label="Loading delivery addresses…" compact />
            ) : addressError ? (
              <div className="checkout-address-error" role="alert">
                <p>{addressError}</p>
                <button type="button" onClick={() => dispatch(fetchCustomerAddresses())}>Try again</button>
              </div>
            ) : addresses.length > 0 ? (
              <div className="checkout-addresses" role="radiogroup" aria-label="Delivery address">
                {addresses.map((address) => {
                  const id = address.id || address._id;
                  const selected = selectedAddress?.id === id || selectedAddress?._id === id;
                  return (
                    <label className={selected ? "selected" : ""} key={id}>
                      <input type="radio" name="deliveryAddress" value={id} checked={selected} disabled={loading} onChange={() => setSelectedAddressId(id)} />
                      <MapPin />
                      <span>
                        <b>{address.label || "Delivery address"}{address.isDefault && <em>Default</em>}</b>
                        <strong>{address.recipientName}</strong>
                        <small>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />{address.city}, {address.state} {address.postalCode}<br />{address.phone}</small>
                      </span>
                      {selected && <Check className="address-selected-icon" />}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="checkout-address-empty">
                <MapPin />
                <b>No delivery address found.</b>
                <p>Add an address from your customer dashboard before placing this order.</p>
                <button type="button" onClick={() => router.push("/dashboard/profile")}>Add an address</button>
              </div>
            )}
          </section>
          <section className="checkout-card">
            <div className="checkout-heading">
              <span>PAYMENT</span>
              <h2>How would you like to pay?</h2>
            </div>
            <div className="checkout-payment-methods" role="radiogroup" aria-label="Payment method">
              <label className={paymentMethod === "demo-card" ? "selected" : ""}>
                <input type="radio" name="paymentMethod" value="demo-card" checked={paymentMethod === "demo-card"} disabled={loading} onChange={() => setPaymentMethod("demo-card")} />
                <CreditCard />
                <span><b>Card payment</b><small>Secure demo card payment.</small></span>
                {paymentMethod === "demo-card" && <Check />}
              </label>
              <label className={paymentMethod === "cod" ? "selected" : ""}>
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} disabled={loading} onChange={() => setPaymentMethod("cod")} />
                <Banknote />
                <span><b>Cash on delivery</b><small>Pay when your order is delivered.</small></span>
                {paymentMethod === "cod" && <Check />}
              </label>
            </div>
            {error && (
              <p className="studio-error" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
        <aside className="order-summary checkout-summary">
          <span>FINAL AMOUNT</span>
          <h2>
            {items.length} print project{items.length === 1 ? "" : "s"}
          </h2>
          <div className="checkout-items">
            {items.map((item) => (
              <div key={item.id || item.key}>
                <span>
                  {item.product?.name || item.productName}
                  <small>{item.quantity} units</small>
                </span>
                <b>{money(item.price?.total ?? item.total)}</b>
              </div>
            ))}
          </div>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>GST</dt>
              <dd>{money(tax)}</dd>
            </div>
            <div className="total">
              <dt>Total</dt>
              <dd>{money(total)}</dd>
            </div>
          </dl>
          <button
            className="journey-button primary"
            disabled={loading || addressLoading || !selectedAddress || items.length === 0}
          >
            {loading ? (
              <ButtonLoader label={paymentMethod === "cod" ? "Placing COD order…" : "Processing payment…"} />
            ) : (
              <>
                {paymentMethod === "cod" ? <Banknote /> : <LockKeyhole />}
                {paymentMethod === "cod" ? "Place COD order" : "Pay & place order"}
              </>
            )}
          </button>
          <p>
            <PackageCheck />
            {paymentMethod === "cod" ? "Payment will be collected when the order is delivered." : "Order confirmation appears immediately after payment."}
          </p>
        </aside>
      </form>
    </main>
  );
}
