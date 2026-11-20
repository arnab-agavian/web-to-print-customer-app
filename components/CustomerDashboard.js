"use client";

import Link from "next/link";
import {
  Bell,
  Check,
  Download,
  FileCheck2,
  Grid2X2,
  LogOut,
  MapPin,
  PackageCheck,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import Header from "./Header";
import { ButtonLoader, LoadingOverlay, LoadingState } from "./LoadingState";
import { decodeAccessToken } from "@/redux/api/authSession";
import { approveProof, requestProofChanges } from "@/redux/api/proofsApi";
import {
  createCustomerAddress,
  fetchCustomerAddress,
  fetchCustomerAddresses,
  fetchDashboardData,
  makeCustomerAddressDefault,
  removeCustomerAddress,
  setDashboardModule,
  updateCustomerAddress,
} from "@/redux/slices/dashboardSlice";
import { fetchOrders, reorderOrder } from "@/redux/slices/ordersSlice";
import { signOut } from "@/redux/slices/authSlice";

const productColors = {
  "MTB Boards": "#7868ff",
  "Labels & Stickers": "#ff5c35",
  "Race & Event Numbers": "#b9f227",
};
const money = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value || 0,
  );
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
const modules = [
  ["overview", "Overview", Grid2X2],
  ["profile", "Account & profile", UserRound],
  ["orders", "Order history", ShoppingBag],
  ["proofs", "Active proofs", FileCheck2],
  ["designs", "Saved designs", Save],
  ["reorder", "Reorder", RefreshCw],
  ["invoices", "Invoices & receipts", ReceiptText],
];

const addressFields = [
  ["Label", "label"],
  ["Recipient name", "recipientName"],
  ["Phone", "phone"],
  ["Address line 1", "addressLine1"],
  ["Address line 2", "addressLine2"],
  ["City", "city"],
  ["State", "state"],
  ["Postal code", "postalCode"],
  ["Country code", "countryCode"],
];
const addressAutoComplete = {
  recipientName: "name",
  phone: "tel",
  addressLine1: "address-line1",
  addressLine2: "address-line2",
  city: "address-level2",
  state: "address-level1",
  postalCode: "postal-code",
  countryCode: "country",
};
const tokenDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value * 1000))
    : "—";
const validateAddress = (values) => {
  const errors = {};
  if (!values.label.trim()) errors.label = "Address label is required.";
  if (!values.recipientName.trim())
    errors.recipientName = "Recipient name is required.";
  else if (values.recipientName.trim().length < 2)
    errors.recipientName = "Enter at least 2 characters.";
  if (!values.phone.trim()) errors.phone = "Phone number is required.";
  else if (!/^\+?[0-9 ()-]{7,20}$/.test(values.phone.trim()))
    errors.phone = "Enter a valid phone number.";
  if (!values.addressLine1.trim())
    errors.addressLine1 = "Address line 1 is required.";
  else if (values.addressLine1.trim().length < 3)
    errors.addressLine1 = "Enter a complete street address.";
  if (!values.city.trim()) errors.city = "City is required.";
  if (!values.state.trim()) errors.state = "State is required.";
  if (!values.postalCode.trim()) errors.postalCode = "Postal code is required.";
  else if (!/^[A-Za-z0-9 -]{3,10}$/.test(values.postalCode.trim()))
    errors.postalCode = "Enter a valid postal code.";
  if (!values.countryCode.trim())
    errors.countryCode = "Country code is required.";
  else if (!/^[A-Za-z]{2,3}$/.test(values.countryCode.trim()))
    errors.countryCode = "Use a 2 or 3 letter country code.";
  return errors;
};

function ProfileSection({ account, dashboard, dispatch }) {
  const [editingId, setEditingId] = useState(null);
  const addresses = dashboard.addresses || [];
  const selectedAddress = addresses.find(
    (item) => (item.id || item._id) === editingId,
  );
  const busy = dashboard.addressStatus === "loading";
  useEffect(() => {
    if (dashboard.addressStatus === "idle") dispatch(fetchCustomerAddresses());
  }, [dashboard.addressStatus, dispatch]);
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      label: selectedAddress?.label || "Home",
      recipientName: selectedAddress?.recipientName || account.fullName || "",
      phone: selectedAddress?.phone || "",
      addressLine1: selectedAddress?.addressLine1 || "",
      addressLine2: selectedAddress?.addressLine2 || "",
      city: selectedAddress?.city || "",
      state: selectedAddress?.state || "",
      postalCode: selectedAddress?.postalCode || "",
      countryCode: selectedAddress?.countryCode || "INR",
      isDefault: selectedAddress?.isDefault || addresses.length === 0,
    },
    validate: validateAddress,
    onSubmit: async (values, { resetForm, setStatus }) => {
      setStatus(null);
      const address = {
        ...Object.fromEntries(
          Object.entries(values)
            .filter(([key]) => key !== "isDefault")
            .map(([key, value]) => [key, value.trim()]),
        ),
        countryCode: values.countryCode.trim().toUpperCase(),
        isDefault: values.isDefault,
      };
      const result = editingId
        ? await dispatch(updateCustomerAddress({ id: editingId, address }))
        : await dispatch(createCustomerAddress(address));
      const succeeded = editingId
        ? updateCustomerAddress.fulfilled.match(result)
        : createCustomerAddress.fulfilled.match(result);
      if (succeeded) {
        setEditingId(null);
        resetForm();
        setStatus("saved");
      }
    },
  });
  function editAddress(address) {
    const id = address.id || address._id;
    setEditingId(id);
    formik.setStatus(null);
    dispatch(fetchCustomerAddress(id));
  }
  function newAddress() {
    setEditingId(null);
    formik.resetForm();
    formik.setStatus(null);
  }
  async function removeAddress(address) {
    const id = address.id || address._id;
    if (!window.confirm(`Delete the ${address.label || "delivery"} address?`))
      return;
    const result = await dispatch(removeCustomerAddress(id));
    if (removeCustomerAddress.fulfilled.match(result) && editingId === id)
      newAddress();
  }
  return (
    <section className="dash-module" aria-busy={busy}>
      {busy && <LoadingOverlay label="Updating delivery addresses…" />}
      <div className="module-heading">
        <span>ACCOUNT & PROFILE</span>
        <h2>Your account details.</h2>
        <p>
          Your identity is read from the signed-in access token. Manage your
          delivery addresses below.
        </p>
      </div>
      <div className="token-profile" aria-label="Access token profile details">
        <div>
          <span>Full name</span>
          <strong>{account.fullName || "—"}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{account.email || "—"}</strong>
        </div>
        <div>
          <span>Customer ID</span>
          <strong>{account.id || "—"}</strong>
        </div>
        <div>
          <span>Role</span>
          <strong>{account.role || "Customer"}</strong>
        </div>
        {account.expiresAt && (
          <div>
            <span>Session expires</span>
            <strong>{tokenDate(account.expiresAt)}</strong>
          </div>
        )}
      </div>
      <div className="address-heading address-heading-row">
        <div>
          <span>DELIVERY ADDRESSES</span>
          <h3>Where should orders be sent?</h3>
        </div>
        <button type="button" onClick={newAddress}>
          <Plus />
          Add address
        </button>
      </div>
      {busy && addresses.length === 0 ? (
        <p className="empty-address" role="status">
          <MapPin />
          Loading delivery addressesâ€¦
        </p>
      ) : addresses.length > 0 ? (
        <div className="address-list">
          {addresses.map((address) => {
            const id = address.id || address._id;
            return (
              <article className={address.isDefault ? "default" : ""} key={id}>
                <MapPin />
                <div>
                  <span>
                    {address.label || "Address"}
                    {address.isDefault && (
                      <em>
                        <Check />
                        Default
                      </em>
                    )}
                  </span>
                  <strong>{address.recipientName}</strong>
                  <p>
                    {address.addressLine1}
                    {address.addressLine2 && <>, {address.addressLine2}</>}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.countryCode} · {address.phone}
                  </p>
                </div>
                <div className="address-actions">
                  <button
                    type="button"
                    onClick={() => editAddress(address)}
                    disabled={busy}
                  >
                    <Pencil />
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => dispatch(makeCustomerAddressDefault(id))}
                      disabled={busy}
                    >
                      <Check />
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeAddress(address)}
                    disabled={busy}
                  >
                    <Trash2 />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-address">
          <MapPin />
          No delivery address saved yet. Add your first address below; the API
          will make it the default automatically.
        </p>
      )}
      <div className="address-form-heading">
        <h3>
          {editingId ? "Edit delivery address" : "Add a delivery address"}
        </h3>
        {editingId && (
          <button type="button" onClick={newAddress}>
            Cancel edit
          </button>
        )}
      </div>
      <form className="profile-form" onSubmit={formik.handleSubmit} noValidate>
        {addressFields.map(([label, name]) => (
          <label
            className={name.startsWith("address") ? "wide" : ""}
            key={name}
          >
            {label}
            {name === "label" ? (
              <select
                name={name}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched[name] && formik.errors[name],
                )}
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Others">Others</option>
              </select>
            ) : (
              <input
                name={name}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete={addressAutoComplete[name]}
                maxLength={name === "countryCode" ? 3 : undefined}
                aria-invalid={Boolean(
                  formik.touched[name] && formik.errors[name],
                )}
              />
            )}
            {formik.touched[name] && formik.errors[name] && (
              <small className="field-error">{formik.errors[name]}</small>
            )}
          </label>
        ))}
        <label className="default-address wide">
          <input
            name="isDefault"
            type="checkbox"
            checked={formik.values.isDefault}
            onChange={formik.handleChange}
          />
          Make this my default delivery address
        </label>
        {dashboard.addressError && (
          <p className="form-error wide" role="alert">
            {dashboard.addressError}
          </p>
        )}
        {formik.status === "saved" && (
          <p className="form-success-inline wide" role="status">
            Address saved successfully.
          </p>
        )}
        <button
          className="journey-button primary"
          type="submit"
          disabled={formik.isSubmitting || busy}
        >
          {formik.isSubmitting || busy
            ? <ButtonLoader label="Saving address…" />
            : editingId
              ? "Update address"
              : "Save address"}
        </button>
      </form>
    </section>
  );
}

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [proofMessage, setProofMessage] = useState("");
  const [proofActionId, setProofActionId] = useState(null);
  const {
    items: orders,
    status: ordersStatus,
    reorderingId,
  } = useSelector((state) => state.orders);
  const dashboard = useSelector((state) => state.dashboard);
  const { user, session, logoutStatus } = useSelector((state) => state.auth);
  useEffect(() => {
    if (ordersStatus === "idle") dispatch(fetchOrders());
    if (dashboard.status === "idle") dispatch(fetchDashboardData());
  }, [dispatch, ordersStatus, dashboard.status]);
  const claims = decodeAccessToken(session?.accessToken) || {};
  const profile = dashboard.profile || {};
  const account = {
    id: claims.sub || claims.userId || claims.id || user?.id || profile.id,
    fullName:
      claims.name ||
      claims.fullName ||
      claims.full_name ||
      user?.fullName ||
      user?.name ||
      profile.fullName ||
      "Customer",
    email: claims.email || user?.email || profile.email,
    role: claims.role || user?.role || profile.role,
    expiresAt: claims.exp,
  };
  const active = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status),
  );
  const completed = orders.filter((order) => order.status === "completed");
  const proofOrders = orders.filter(
    (order) =>
      order.status === "proof" || order.proof_status === "awaiting_approval",
  );
  async function logout() {
    await dispatch(signOut());
    router.push("/login");
  }
  async function handleProof(order, action) {
    setProofActionId(order.id);
    setProofMessage("Updating proof…");
    try {
      if (action === "approve") {
        await approveProof(order.id);
        setProofMessage(`${order.order_number} approved for production.`);
      } else {
        await requestProofChanges(
          order.id,
          "Please review the artwork alignment.",
        );
        setProofMessage(`Revision requested for ${order.order_number}.`);
      }
    } finally {
      setProofActionId(null);
    }
  }
  function Orders({ reorder = false }) {
    return (
      <section className="dash-module">
        <div className="module-heading">
          <span>{reorder ? "REORDER" : "ORDER HISTORY"}</span>
          <h2>
            {reorder
              ? "Reuse previous artwork."
              : "Every project, in one place."}
          </h2>
          <p>
            {reorder
              ? "Select a previous job and create a new order with the same production setup."
              : "Track proof, production and completion status."}
          </p>
        </div>
        <div className="module-orders">
          {orders.map((order) => (
            <article key={order.id}>
              <i
                style={{
                  background: productColors[order.product_name] || "#7868ff",
                }}
              />
              <div>
                <b>{order.order_number}</b>
                <span>
                  {order.product_name} · {order.quantity} units
                </span>
                <small>{date(order.created_at)}</small>
              </div>
              <em className={`status ${order.status}`}>{order.status}</em>
              <strong>{money(order.total)}</strong>
              {reorder ? (
                <button
                  disabled={reorderingId === order.id}
                  onClick={() => dispatch(reorderOrder(order.id))}
                >
                  <RefreshCw />
                  {reorderingId === order.id ? <ButtonLoader label="Creating…" /> : "Reorder"}
                </button>
              ) : (
                <Link href="/dashboard">View status</Link>
              )}
            </article>
          ))}
        </div>
      </section>
    );
  }
  function Proofs() {
    return (
      <section className="dash-module">
        <div className="module-heading">
          <span>ACTIVE PROOFS</span>
          <h2>Review before we print.</h2>
          <p>
            Approve the exact version or request a revision from the studio.
          </p>
        </div>
        {proofMessage && (
          <div className="module-message">
            <Check />
            {proofMessage}
          </div>
        )}
        <div className="proof-grid">
          {proofOrders.map((order) => (
            <article key={order.id}>
              <div
                className="proof-visual"
                style={{
                  background: productColors[order.product_name] || "#7868ff",
                }}
              >
                <b>{order.product_name}</b>
                <span>PROOF V2</span>
              </div>
              <div>
                <small>{order.order_number}</small>
                <h3>{order.product_name}</h3>
                <p>Production proof · {order.quantity} units</p>
                <button disabled={proofActionId === order.id} onClick={() => handleProof(order, "approve")}>
                  <Check />
                  {proofActionId === order.id ? <ButtonLoader label="Updating…" /> : "Approve proof"}
                </button>
                <button
                  className="outline"
                  disabled={proofActionId === order.id}
                  onClick={() => handleProof(order, "change")}
                >
                  Request changes
                </button>
              </div>
            </article>
          ))}
        </div>
        {proofOrders.length === 0 && <p>No proofs currently need attention.</p>}
      </section>
    );
  }
  function Designs() {
    return (
      <section className="dash-module">
        <div className="module-heading">
          <span>SAVED DESIGNS</span>
          <h2>Your fastest route to reprint.</h2>
          <p>
            Open a saved design in the studio and update its print
            configuration.
          </p>
        </div>
        <div className="saved-design-grid">
          {dashboard.designs.map((design) => (
            <article key={design.id}>
              <div style={{ background: design.color }}>
                <strong>{design.designText}</strong>
                <small>{design.productName}</small>
              </div>
              <h3>{design.name}</h3>
              <p>Updated {date(design.updatedAt)}</p>
              <Link href={`/configure/${design.productSlug}`}>
                Reuse design
              </Link>
            </article>
          ))}
        </div>
      </section>
    );
  }
  function Invoices() {
    return (
      <section className="dash-module">
        <div className="module-heading">
          <span>INVOICES & RECEIPTS</span>
          <h2>Documents, ready when needed.</h2>
          <p>Download demo invoice records for completed and paid orders.</p>
        </div>
        <div className="invoice-list">
          {dashboard.invoices.map((invoice) => (
            <article key={invoice.id}>
              <ReceiptText />
              <div>
                <b>{invoice.id}</b>
                <span>
                  {invoice.orderNumber} · {invoice.date}
                </span>
              </div>
              <em>{invoice.status}</em>
              <strong>{money(invoice.amount)}</strong>
              <button>
                <Download />
                Download
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  }
  function Overview() {
    const proof = proofOrders[0];
    return (
      <>
        <div className="dash-title">
          <div>
            <span className="eyebrow dark">
              <span />
              CUSTOMER DASHBOARD
            </span>
            <h1>Good morning, {account.fullName?.split(" ")[0]}.</h1>
            <p>Here is what is moving through the studio.</p>
          </div>
          <button className="icon-button light">
            <Bell />
            <i />
          </button>
        </div>
        <div className="status-cards">
          <div>
            <span className="stat-icon purple">
              <PackageCheck />
            </span>
            <p>
              <b>{active.length}</b>
              <span>
                Active orders<small>Across proof and production</small>
              </span>
            </p>
          </div>
          <div>
            <span className="stat-icon green">
              <Check />
            </span>
            <p>
              <b>{completed.length}</b>
              <span>
                Completed<small>Ready to reorder</small>
              </span>
            </p>
          </div>
          <div>
            <span className="stat-icon orange">
              <Save />
            </span>
            <p>
              <b>{dashboard.designs.length}</b>
              <span>
                Saved designs<small>Reusable production artwork</small>
              </span>
            </p>
          </div>
        </div>
        {proof && (
          <section className="active-proof">
            <div className="proof-art">
              <div>
                PROOF
                <br />
                <b>V2</b>
                <small>{proof.product_name}</small>
              </div>
              <span>ACTION NEEDED</span>
            </div>
            <div className="proof-copy">
              <span className="alert-pill">REVIEW READY</span>
              <h2>Your proof is ready.</h2>
              <p>
                {proof.product_name} · {proof.order_number}
              </p>
              <small>Updated {date(proof.created_at)}</small>
              <button
                className="button button-dark"
                onClick={() => dispatch(setDashboardModule("proofs"))}
              >
                Review proof
              </button>
            </div>
          </section>
        )}
        <div className="table-heading">
          <div>
            <h2>Recent orders</h2>
            <p>Track or reorder any past job.</p>
          </div>
          <button
            className="text-link dark-link"
            onClick={() => dispatch(setDashboardModule("orders"))}
          >
            View all
          </button>
        </div>
        <div className="module-orders compact">
          {orders.slice(0, 3).map((order) => (
            <article key={order.id}>
              <i
                style={{
                  background: productColors[order.product_name] || "#7868ff",
                }}
              />
              <div>
                <b>{order.order_number}</b>
                <span>
                  {order.product_name} · {order.quantity} units
                </span>
              </div>
              <em className={`status ${order.status}`}>{order.status}</em>
              <strong>{money(order.total)}</strong>
            </article>
          ))}
        </div>
      </>
    );
  }
  const content = {
    overview: <Overview />,
    profile: (
      <ProfileSection
        account={account}
        dashboard={dashboard}
        dispatch={dispatch}
      />
    ),
    orders: <Orders />,
    proofs: <Proofs />,
    designs: <Designs />,
    reorder: <Orders reorder />,
    invoices: <Invoices />,
  }[dashboard.activeModule];
  return (
    <main className="dashboard-page">
      <Header dark />
      <div className="dash-wrap enhanced">
        <aside className="dash-sidebar">
          <div className="profile-chip">
            <div>
              {account.fullName
                ?.split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <span>
              <b>{account.fullName}</b>
              <small>{account.email}</small>
            </span>
          </div>
          <nav>
            {modules.map(([id, label, Icon]) => (
              <button
                className={dashboard.activeModule === id ? "active" : ""}
                onClick={() => dispatch(setDashboardModule(id))}
                key={id}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>
          <button onClick={logout} disabled={logoutStatus === "loading"}>
            <LogOut />
            {logoutStatus === "loading" ? <ButtonLoader label="Signing out…" /> : "Sign out"}
          </button>
        </aside>
        <section className="dash-main">
          {dashboard.status === "loading" || ordersStatus === "loading" ? (
            <div className="dashboard-loading"><LoadingState label="Loading your workspace…" /></div>
          ) : (
            content
          )}
        </section>
      </div>
    </main>
  );
}
