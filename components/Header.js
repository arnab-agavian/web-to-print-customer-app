"use client";

import Link from "next/link";
import { LogOut, Menu, ShoppingBag, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, selectCartCount } from "@/redux/slices/cartSlice";
import { signOut } from "@/redux/slices/authSlice";
import { LoadingSpinner } from "./LoadingState";

export default function Header({ dark = false }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const cartStatus = useSelector((state) => state.cart.status);
  const { session, logoutStatus } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(session?.accessToken);

  useEffect(() => {
    if (isAuthenticated && cartStatus === "idle") dispatch(fetchCart());
  }, [cartStatus, dispatch, isAuthenticated]);

  async function logOut() {
    await dispatch(signOut());
    router.push("/login");
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
      <nav className={open ? "nav-open" : ""}>
        <Link href="/#products">Products</Link>
        <Link href="/#work">Our work</Link>
        <Link href="/#about">About</Link>
        <Link href="/#contact">Contact</Link>
        <Link href="/dashboard">Dashboard</Link>
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
        <Link href="/cart" className="icon-button" aria-label="Cart">
          <ShoppingBag size={19} />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}
