'use client';

import Link from 'next/link';
import { Check, FileCheck2, PackageCheck } from 'lucide-react';
import { useSelector } from 'react-redux';
import Header from './Header';

export default function OrderConfirmation(){const order=useSelector((state)=>state.checkout.order);return <main className="confirmation-page"><Header dark/><section><div className="confirmation-mark"><Check/></div><span>ORDER CONFIRMED</span><h1>Your project is<br/>in the proof queue.</h1><p>{order?`Order ${order.order_number} has been created.`:'Your demo order has been created.'} We will notify you when the production proof is ready to review.</p><div className="confirmation-steps"><div><FileCheck2/><span><b>Proof preparation</b><small>Artwork preflight and production setup</small></span></div><div><PackageCheck/><span><b>Production after approval</b><small>Nothing prints until you approve</small></span></div></div><div className="confirmation-actions"><Link className="journey-button primary" href="/dashboard">Open customer dashboard</Link><Link className="journey-button secondary" href="/#products">Start another project</Link></div></section></main>}
