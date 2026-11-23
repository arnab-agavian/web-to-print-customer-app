"use client";

import Link from "next/link";
import { Bell, Check, CheckCheck, LogOut, Menu, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, selectCartCount } from "@/redux/slices/cartSlice";
import { signOut } from "@/redux/slices/authSlice";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  readAllNotifications,
  readNotification,
  removeNotification,
} from "@/redux/slices/notificationsSlice";
import { LoadingSpinner } from "./LoadingState";

const notificationDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
};

const notificationType = (value = "") => value.replaceAll("_", " ");

export default function Header({ dark = false }) {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const cartStatus = useSelector((state) => state.cart.status);
  const { session, logoutStatus } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.notifications);
  const isAuthenticated = Boolean(session?.accessToken);

  useEffect(() => {
    if (isAuthenticated && cartStatus === "idle") dispatch(fetchCart());
  }, [cartStatus, dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && notifications.countStatus === "idle") {
      dispatch(fetchUnreadNotificationCount());
    }
  }, [dispatch, isAuthenticated, notifications.countStatus]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  function toggleNotifications() {
    setNotificationsOpen((current) => {
      const next = !current;
      if (next) dispatch(fetchNotifications({ limit: 20, offset: 0 }));
      return next;
    });
  }

  async function logOut() {
    await dispatch(signOut());
    router.replace("/login");
  }

  return (
    <header className={`site-header ${dark ? "header-dark" : ""}`}>
      <Link href="/" className="brand" aria-label="Digital Heroes home">
        <span className="brand-glyph">DH</span>
        <span>
          Digital
          <br />
          Heroes
        </span>
      </Link>
      <nav id="site-navigation" className={open ? "nav-open" : ""}>
        <Link href="/#products">Products</Link>
        <Link href="/#work">Our work</Link>
        <Link href="/#about">About</Link>
        <Link href="/#contact">Contact</Link>
        <Link href={isAuthenticated ? "/dashboard/overview" : "/login"}>
          {isAuthenticated ? "Dashboard" : "Sign in"}
        </Link>
      </nav>
      <div className="header-actions">
        {isAuthenticated ? (
          <button
            type="button"
            className="icon-button"
            aria-label="Log out"
            title="Log out"
            onClick={logOut}
            disabled={logoutStatus === "loading"}
          >
            {logoutStatus === "loading" ? <LoadingSpinner size="small" /> : <LogOut size={19} />}
          </button>
        ) : (
          <Link href="/login" className="icon-button" aria-label="Log in" title="Log in">
            <UserRound size={19} />
          </Link>
        )}
        {isAuthenticated && (
          <div className="notification-center" ref={notificationRef}>
            <button
              type="button"
              className="icon-button notification-trigger"
              aria-label={`Notifications${notifications.unreadCount ? `, ${notifications.unreadCount} unread` : ""}`}
              aria-haspopup="dialog"
              aria-expanded={notificationsOpen}
              aria-controls="notification-dropdown"
              onClick={toggleNotifications}
            >
              <Bell size={19} />
              {notifications.unreadCount > 0 && (
                <span className="notification-badge">
                  {notifications.unreadCount > 99 ? "99+" : notifications.unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <section
                id="notification-dropdown"
                className="notification-dropdown"
                role="dialog"
                aria-label="Notifications"
              >
                <header>
                  <div>
                    <span>UPDATES</span>
                    <h2>Notifications</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(readAllNotifications())}
                    disabled={!notifications.unreadCount || notifications.markingAll}
                  >
                    {notifications.markingAll ? <LoadingSpinner size="small" /> : <CheckCheck />}
                    Mark all read
                  </button>
                </header>

                {notifications.status === "loading" && !notifications.items.length ? (
                  <div className="notification-state" role="status">
                    <LoadingSpinner />
                    Loading notifications…
                  </div>
                ) : notifications.status === "failed" ? (
                  <div className="notification-state error" role="alert">
                    <p>{notifications.error}</p>
                    <button type="button" onClick={() => dispatch(fetchNotifications({ limit: 20, offset: 0 }))}>
                      Try again
                    </button>
                  </div>
                ) : notifications.items.length ? (
                  <div className="notification-list">
                    {notifications.items.map((notification) => {
                      const pending = notifications.pendingIds.includes(notification.id);
                      return (
                        <article
                          className={`notification-item${notification.isRead ? "" : " unread"}`}
                          key={notification.id}
                        >
                          <button
                            type="button"
                            className="notification-copy"
                            onClick={() => !notification.isRead && dispatch(readNotification(notification.id))}
                            disabled={pending}
                            aria-label={`${notification.title}${notification.isRead ? "" : ", mark as read"}`}
                          >
                            <i aria-hidden="true" />
                            <span>
                              <strong>{notification.title}</strong>
                              {notification.message && <p>{notification.message}</p>}
                              <small>
                                {notificationType(notification.type)}
                                {notification.createdAt && ` · ${notificationDate(notification.createdAt)}`}
                              </small>
                            </span>
                          </button>
                          <div className="notification-actions">
                            {!notification.isRead && (
                              <button
                                type="button"
                                title="Mark as read"
                                aria-label="Mark as read"
                                onClick={() => dispatch(readNotification(notification.id))}
                                disabled={pending}
                              >
                                <Check />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete notification"
                              aria-label="Delete notification"
                              onClick={() => dispatch(removeNotification(notification.id))}
                              disabled={pending}
                            >
                              {pending ? <LoadingSpinner size="small" /> : <Trash2 />}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notification-state">
                    <Bell />
                    You’re all caught up.
                  </div>
                )}

                {notifications.actionError && (
                  <p className="notification-action-error" role="alert">
                    {notifications.actionError}
                  </p>
                )}
              </section>
            )}
          </div>
        )}
        <Link href="/cart" className="icon-button" aria-label="Cart">
          <ShoppingBag size={19} />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        <button
          type="button"
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="site-navigation"
          aria-expanded={open}
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}
