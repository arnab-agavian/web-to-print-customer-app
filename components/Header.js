"use client";

import Link from "next/link";
import { Menu, ShoppingBag, UserRound } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCartCount } from "@/redux/slices/cartSlice";

export default function Header({ dark = false }) {
  const [open, setOpen] = useState(false);
  const cartCount = useSelector(selectCartCount);
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
        <Link href="/login" className="icon-button" aria-label="Account">
          <UserRound size={19} />
        </Link>
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
