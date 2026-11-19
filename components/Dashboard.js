"use client";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  Grid2X2,
  LogOut,
  PackageCheck,
  RefreshCw,
  Settings,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { fetchOrders, reorderOrder } from "@/redux/slices/ordersSlice";
import { signOut } from "@/redux/slices/authSlice";

const productColors = {
  "MTB Boards": "#7868ff",
  "Labels & Stickers": "#ff5c35",
  "Race & Event Numbers": "#b9f227",
};
const titleCase = (value = "Order") =>
  value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, status, error, reorderingId } = useSelector(
    (state) => state.orders,
  );
  const { user, logoutStatus } = useSelector((state) => state.auth);
  useEffect(() => {
    if (status === "idle") dispatch(fetchOrders());
  }, [dispatch, status]);
  const orders = items.map((order) => ({
    apiId: order.id,
    id: order.order_number || order.orderNumber || order.id,
    product:
      order.product_name || order.items?.[0]?.product?.name || "Custom print",
    quantity: order.quantity || order.items?.[0]?.quantity || 0,
    total: Number(order.total || 0),
    status: titleCase(order.status),
    date: formatDate(order.created_at || order.createdAt),
    color: productColors[order.product_name] || "#7868ff",
  }));
  const customerName =
    items[0]?.customer_name || user?.fullName || user?.name || "Maya Brooks";
  const firstName = customerName.split(" ")[0];
  const activeCount = items.filter(
    (order) => !["completed", "cancelled"].includes(order.status),
  ).length;
  const completedCount = items.filter(
    (order) => order.status === "completed",
  ).length;
  const proofOrder = orders.find(
    (order) => order.status.toLowerCase() === "proof",
  );
  async function logOut() {
    await dispatch(signOut());
    router.push("/login");
  }
  return (
    <main className="dashboard-page">
      <Header dark />
      <div className="dash-wrap">
        <aside className="dash-sidebar">
          <div className="profile-chip">
            <div>
              {customerName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span>
              <b>{customerName}</b>
              <small>{user?.email || "maya@example.com"}</small>
            </span>
          </div>
          <nav>
            <a className="active">
              <Grid2X2 />
              Overview
            </a>
            <a>
              <ShoppingBag />
              Orders <span>{orders.length}</span>
            </a>
            <a>
              <FileCheck2 />
              Saved designs <span>4</span>
            </a>
            <a>
              <UserRound />
              Profile
            </a>
            <a>
              <Settings />
              Settings
            </a>
          </nav>
          <button onClick={logOut} disabled={logoutStatus === "loading"}>
            <LogOut />
            {logoutStatus === "loading" ? "Signing out…" : "Sign out"}
          </button>
        </aside>
        <section className="dash-main">
          <div className="dash-title">
            <div>
              <span className="eyebrow dark">
                <span />
                CUSTOMER DASHBOARD
              </span>
              <h1>Good morning, {firstName}.</h1>
              <p>Here’s what’s moving through the studio.</p>
            </div>
            <button className="icon-button light">
              <Bell />
              <i />
            </button>
          </div>
          <div className="status-cards">
            <div>
              <span className="stat-icon purple">
                <Clock3 />
              </span>
              <p>
                <b>{activeCount}</b>
                <span>
                  Active orders
                  <small>
                    {proofOrder
                      ? "One needs your approval"
                      : "Everything is moving"}
                  </small>
                </span>
              </p>
            </div>
            <div>
              <span className="stat-icon green">
                <PackageCheck />
              </span>
              <p>
                <b>{completedCount}</b>
                <span>
                  Completed<small>From your API order history</small>
                </span>
              </p>
            </div>
            <div>
              <span className="stat-icon orange">
                <FileCheck2 />
              </span>
              <p>
                <b>4</b>
                <span>
                  Saved designs<small>Ready to reorder</small>
                </span>
              </p>
            </div>
          </div>
          {proofOrder && (
            <section className="active-proof">
              <div className="proof-art">
                <div>
                  RIDE
                  <br />
                  <b>042</b>
                  <small>TRAIL SERIES</small>
                </div>
                <span>PROOF READY</span>
              </div>
              <div className="proof-copy">
                <span className="alert-pill">ACTION NEEDED</span>
                <h2>Your proof is ready.</h2>
                <p>
                  {proofOrder.product} · Order {proofOrder.id}
                </p>
                <small>Updated {proofOrder.date}</small>
                <div>
                  <button className="button button-dark">
                    Review proof <ChevronRight />
                  </button>
                  <button className="text-link dark-link">
                    Request a change
                  </button>
                </div>
              </div>
            </section>
          )}
          <div className="table-heading">
            <div>
              <h2>Recent orders</h2>
              <p>Track, download or reorder any past job.</p>
            </div>
            <button className="text-link dark-link">
              View all <ChevronRight />
            </button>
          </div>
          <div className="orders-table">
            <div className="orders-head">
              <span>Order</span>
              <span>Product</span>
              <span>Status</span>
              <span>Total</span>
              <span />
            </div>
            {status === "loading" && (
              <p className="form-error">Loading orders…</p>
            )}
            {error && <p className="form-error">{error}</p>}
            {status === "succeeded" && orders.length === 0 && (
              <p className="form-error">No orders yet.</p>
            )}
            {orders.map((o) => (
              <div className="order-row" key={o.apiId}>
                <span>
                  <i style={{ background: o.color }} />
                  <b>{o.id}</b>
                  <small>{o.date}</small>
                </span>
                <span>
                  {o.product}
                  <small>{o.quantity} units</small>
                </span>
                <span>
                  <em className={`status ${o.status.toLowerCase()}`}>
                    {o.status}
                  </em>
                </span>
                <span>₹{o.total.toFixed(2)}</span>
                <span>
                  <button title="Download invoice">
                    <Download />
                  </button>
                  <button
                    title="Reorder"
                    disabled={reorderingId === o.apiId}
                    onClick={() => dispatch(reorderOrder(o.apiId))}
                  >
                    <RefreshCw />
                  </button>
                </span>
              </div>
            ))}
          </div>
          <section className="saved-row">
            <div>
              <h2>Saved designs</h2>
              <p>Skip the setup and go straight to quantity.</p>
            </div>
            <div className="mini-design orange-design">
              GOOD
              <br />
              THINGS<small>Sticker · 100 mm</small>
            </div>
            <div className="mini-design purple-design">
              27<small>MTB board · 240 mm</small>
            </div>
            <Link href="/#products" className="new-design">
              <span>+</span>Start something new
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}
