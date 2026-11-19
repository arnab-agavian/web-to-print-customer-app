'use client';

import Link from 'next/link';
import { Minus, PackageOpen, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import { removeFromCart,selectCartSubtotal,selectCartTax,selectCartTotal,updateCartQuantity } from '@/redux/slices/cartSlice';

const money=(value)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value||0);

export default function CartPage(){
 const dispatch=useDispatch();
 const items=useSelector((state)=>state.cart.items);
 const subtotal=useSelector(selectCartSubtotal);const tax=useSelector(selectCartTax);const total=useSelector(selectCartTotal);
 return <main className="journey-page"><div className="journey-dark"><Header/><div className="journey-hero"><span>YOUR PROJECTS</span><h1>Review your cart.</h1><p>Check the print specs and artwork before moving to delivery and payment.</p></div></div><div className="cart-layout">{items.length===0?<section className="empty-state"><PackageOpen/><h2>Your cart is ready for a bright idea.</h2><p>Choose a product, configure it and create your artwork in the studio.</p><Link className="journey-button primary" href="/#products">Browse products</Link></section>:<><section className="cart-list">{items.map((item)=><article className="cart-item" key={item.key}><div className="cart-art" style={{background:item.color}}><strong>{item.designMethod==='upload'?'ART':item.designText}</strong><small>{item.productName}</small></div><div className="cart-copy"><span>PRINT PROJECT</span><h2>{item.productName}</h2><p>{item.width} × {item.height} mm · {item.material===1?'Standard':'Premium'} finish</p><small>{item.artworkName||item.designText}</small><div className="cart-actions"><div><button onClick={()=>dispatch(updateCartQuantity({key:item.key,quantity:item.quantity-10}))}><Minus/></button><b>{item.quantity}</b><button onClick={()=>dispatch(updateCartQuantity({key:item.key,quantity:item.quantity+10}))}><Plus/></button></div><Link href={`/configure/${item.productSlug}`}>Modify design</Link><button className="remove" onClick={()=>dispatch(removeFromCart(item.key))}><Trash2/>Remove</button></div></div><div className="cart-price"><b>{money(item.total)}</b><small>{money(item.unit)} each</small></div></article>)}</section><aside className="order-summary"><span>ORDER SUMMARY</span><h2>Ready for checkout?</h2><dl><div><dt>Print subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>GST</dt><dd>{money(tax)}</dd></div><div className="total"><dt>Total</dt><dd>{money(total)}</dd></div></dl><Link className="journey-button primary" href="/checkout">Continue to checkout</Link><p><ShieldCheck/>Your order is only produced after proof approval.</p></aside></>}</div></main>;
}
