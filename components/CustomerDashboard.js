"use client";

import Link from "next/link";
import {
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
import ProofPreviewModal from "./ProofPreviewModal";
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
import { fetchSavedDesigns } from "@/redux/slices/designsSlice";
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
const addressFieldNames = new Set(addressFields.map(([, name]) => name));
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
const proofPreviewValue = (proof = {}) =>
  proof.previewUrl || proof.publicUrl || proof.previewPath || proof.previewpath || proof.preview_path || "";
const isAbsolutePreviewUrl = (value = "") => /^https?:\/\//i.test(value);
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
  else if (!/^[A-Za-z]{2}$/.test(values.countryCode.trim()))
    errors.countryCode = "Use a 2-letter country code.";
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
      countryCode: selectedAddress?.countryCode || "IN",
      isDefault: selectedAddress?.isDefault || addresses.length === 0,
    },
    validate: validateAddress,
    onSubmit: async (values, { resetForm, setErrors, setStatus, setTouched }) => {
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
        return;
      }

      const serverErrors = Array.isArray(result.payload?.errors)
        ? result.payload.errors
        : [];
      const fieldErrors = Object.fromEntries(
        serverErrors
          .filter(({ field, message }) => addressFieldNames.has(field) && message)
          .map(({ field, message }) => [field, message]),
      );
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        setTouched(
          Object.fromEntries(Object.keys(fieldErrors).map((field) => [field, true])),
          false,
        );
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

export default function CustomerDashboard({ section = "overview" }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [proofMessage, setProofMessage] = useState("");
  const [proofActionId, setProofActionId] = useState(null);
  const [changeRequestId, setChangeRequestId] = useState(null);
  const [changeRequestText, setChangeRequestText] = useState("");
  const [proofError, setProofError] = useState("");
  const [previewModal, setPreviewModal] = useState(null);
  const {
    items: orders,
    status: ordersStatus,
    error: ordersError,
    reorderingId,
  } = useSelector((state) => state.orders);
  const dashboard = useSelector((state) => state.dashboard);
  const designsState = useSelector((state) => state.designs);
  const { user, session, logoutStatus } = useSelector((state) => state.auth);
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);
  useEffect(() => {
    if (dashboard.status === "idle") dispatch(fetchDashboardData());
  }, [dashboard.status, dispatch]);
  useEffect(() => {
    if (section === "designs") dispatch(fetchSavedDesigns());
  }, [dispatch, section]);
  useEffect(() => {
    if (dashboard.activeModule !== section) dispatch(setDashboardModule(section));
  }, [dashboard.activeModule, dispatch, section]);
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
  const proofEntries = orders.flatMap((order) => (Array.isArray(order.proofs) ? order.proofs : [])
    .filter((proof) => proof.status === "pending")
    .map((proof) => ({ order, proof })));
  async function logout() {
    await dispatch(signOut());
    router.push("/login");
  }
  async function handleProof(order, proof, action, message = "") {
    setProofActionId(proof.id);
    setProofError("");
    setProofMessage("Updating proof…");
    try {
      if (action === "approve") {
        await approveProof(proof.id);
        setProofMessage(`${order.order_number} proof version ${proof.version} approved for production.`);
      } else {
        const requestMessage = message.trim();
        if (requestMessage.length < 5) {
          setProofMessage("");
          setProofError("Describe the requested change using at least 5 characters.");
          return;
        }
        await requestProofChanges(proof.id, requestMessage);
        setProofMessage(`Changes requested for ${order.order_number}, proof version ${proof.version}.`);
        setChangeRequestId(null);
        setChangeRequestText("");
      }
      await dispatch(fetchOrders());
    } catch (error) {
      setProofMessage("");
      setProofError(error.message || "Unable to update this proof.");
    } finally {
      setProofActionId(null);
    }
  }
  function Orders({ reorder = false } = {}) {
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
              : `Track proof, production and completion status for all ${orders.length} orders.`}
          </p>
        </div>
        {ordersError && <p className="form-error" role="alert">{ordersError}</p>}
        <div className="module-orders">
          {orders.map((order) => (
            <article
              className={!reorder ? "order-clickable" : ""}
              key={order.id}
              role={!reorder ? "link" : undefined}
              tabIndex={!reorder ? 0 : undefined}
              onClick={!reorder ? () => router.push(`/orders/${order.id}`) : undefined}
              onKeyDown={!reorder ? (event) => { if (event.key === "Enter") router.push(`/orders/${order.id}`); } : undefined}
            >
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
              <strong>{money(order?.total)}</strong>
              {reorder ? (
                <button
                  disabled={reorderingId === order.id}
                  onClick={() => dispatch(reorderOrder(order.id))}
                >
                  <RefreshCw />
                  {reorderingId === order.id ? <ButtonLoader label="Creating…" /> : "Reorder"}
                </button>
              ) : (
                <Link href={`/orders/${order.id}`} onClick={(event) => event.stopPropagation()}>View details</Link>
              )}
            </article>
          ))}
        </div>
        {!ordersError && orders.length === 0 && <p className="module-empty">No orders have been placed yet.</p>}
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
  function ProofActions() {
    return (
      <section className="dash-module">
        <div className="module-heading">
          <span>ACTIVE PROOFS</span>
          <h2>Review before we print.</h2>
          <p>Approve the exact proof version or tell the studio precisely what needs to change.</p>
        </div>
        {proofMessage && <div className="module-message"><Check />{proofMessage}</div>}
        {proofError && <p className="form-error" role="alert">{proofError}</p>}
        <div className="proof-grid">
          {proofEntries.map(({ order, proof }) => {
            const preview = proofPreviewValue(proof);
            const hasPreviewUrl = isAbsolutePreviewUrl(preview);
            const previewTitle = `${order.order_number} proof version ${proof.version}`;
            return (
            <article key={proof.id}>
              {hasPreviewUrl ? (
                <button type="button" className="proof-visual has-preview" style={{ background: productColors[order.product_name] || "#7868ff" }} onClick={() => setPreviewModal({ preview, title: previewTitle })} aria-label={`Open ${previewTitle}`}>
                  <img src={preview} alt={previewTitle} />
                  <div><b>{order.product_name}</b><span>PROOF V{proof.version} · Click to preview</span></div>
                </button>
              ) : (
                <div className="proof-visual" style={{ background: productColors[order.product_name] || "#7868ff" }}>
                  <div><b>{order.product_name}</b><span>PROOF V{proof.version}</span></div>
                </div>
              )}
              <div>
                <small>{order.order_number}</small>
                <h3>{order.product_name}</h3>
                <p>Production proof · {order.quantity} units{proof.notes ? <><br />{proof.notes}</> : null}</p>
                {hasPreviewUrl ? <button type="button" className="proof-preview-link" onClick={() => setPreviewModal({ preview, title: previewTitle })}>Open proof preview</button> : preview ? <div className="proof-preview-path"><span>Preview storage path</span><code title={preview}>{preview}</code><small>This private file needs a signed preview URL before it can open.</small></div> : <p className="proof-preview-missing">No preview file has been attached.</p>}
                <button disabled={proofActionId === proof.id} onClick={() => handleProof(order, proof, "approve")}><Check />{proofActionId === proof.id ? <ButtonLoader label="Updating…" /> : "Approve proof"}</button>
                <button className="outline" disabled={proofActionId === proof.id} onClick={() => { setChangeRequestId(proof.id); setChangeRequestText(""); setProofError(""); }}>Request changes</button>
                {changeRequestId === proof.id && (
                  <form className="proof-change-form" onSubmit={(event) => { event.preventDefault(); handleProof(order, proof, "change", changeRequestText); }}>
                    <label htmlFor={`proof-change-${proof.id}`}>What should be changed?</label>
                    <textarea id={`proof-change-${proof.id}`} value={changeRequestText} minLength="5" maxLength="2000" placeholder="Please move the race number slightly higher." disabled={proofActionId === proof.id} onChange={(event) => setChangeRequestText(event.target.value)} required />
                    <small>{changeRequestText.length}/2000</small>
                    <div><button type="button" className="outline" disabled={proofActionId === proof.id} onClick={() => { setChangeRequestId(null); setChangeRequestText(""); }}>Cancel</button><button type="submit" disabled={proofActionId === proof.id || changeRequestText.trim().length < 5}>{proofActionId === proof.id ? <ButtonLoader label="Sending…" /> : "Send request"}</button></div>
                  </form>
                )}
              </div>
            </article>
          );})}
        </div>
        {proofEntries.length === 0 && <p className="module-empty">No proofs currently need attention.</p>}
      </section>
    );
  }
  function Designs() {
    const savedDesigns = designsState.saved || [];
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
        {designsState.savedStatus === "loading" ? <LoadingState label="Loading saved designs…" /> : designsState.savedError ? <div className="form-error" role="alert">{designsState.savedError}<button type="button" onClick={() => dispatch(fetchSavedDesigns())}>Try again</button></div> : <div className="saved-design-grid">
          {savedDesigns.map((design) => {
            const layers = Array.isArray(design.designData?.layers) ? design.designData.layers : [];
            const textValue = layers.find((layer) => layer.type === "text" && layer.value)?.value || "DESIGN";
            const productName = design.product?.name || design.productName || "Custom print";
            const productSlug = design.product?.slug || design.productSlug;
            return (
              <article key={design.id}>
                <div style={{ background: design.color || "#7868ff" }}><strong>{textValue}</strong><small>{productName}</small></div>
                <span className={`design-status ${design.status || "draft"}`}>{design.status || "draft"}</span>
                <h3>{design.name}</h3>
                <p>Updated {date(design.updatedAt || design.updated_at)}</p>
                {productSlug && <Link href={`/configure/${productSlug}?designId=${encodeURIComponent(design.id)}`}>Open design</Link>}
              </article>
            );
          })}
          {savedDesigns.length === 0 && <p className="module-empty">No saved designs yet.</p>}
        </div>}
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
              <Link className="button button-dark" href="/dashboard/proofs">
                Review proof
              </Link>
            </div>
          </section>
        )}
        <div className="table-heading">
          <div>
            <h2>Recent orders</h2>
            <p>Track or reorder any past job.</p>
          </div>
          <Link
            className="text-link dark-link"
            href="/dashboard/orders"
          >
            View all
          </Link>
        </div>
        <div className="module-orders compact">
          {orders.slice(0, 3).map((order) => (
            <article className="order-clickable" key={order.id} role="link" tabIndex="0" onClick={() => router.push(`/orders/${order.id}`)} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/orders/${order.id}`); }}>
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
              <strong>{money(order?.total)}</strong>
            </article>
          ))}
        </div>
      </>
    );
  }
  const content = {
    overview: Overview(),
    profile: (
      <ProfileSection
        account={account}
        dashboard={dashboard}
        dispatch={dispatch}
      />
    ),
    orders: Orders(),
    proofs: ProofActions(),
    designs: Designs(),
    reorder: Orders({ reorder: true }),
    invoices: Invoices(),
  }[section];
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
              <Link
                href={`/dashboard/${id}`}
                className={section === id ? "active" : ""}
                aria-current={section === id ? "page" : undefined}
                key={id}
              >
                <Icon />
                {label}
              </Link>
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
      <ProofPreviewModal preview={previewModal?.preview} title={previewModal?.title} onClose={() => setPreviewModal(null)} />
    </main>
  );
}
