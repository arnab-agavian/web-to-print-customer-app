'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUpRight, MoveRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import { ProductMark } from './icons';
import { fetchProducts } from '@/redux/slices/productsSlice';

export default function HomePage() {
  const dispatch = useDispatch();
  const { items: products, status } = useSelector((state) => state.products);
  useEffect(()=>{if(status==='idle')dispatch(fetchProducts())},[dispatch,status]);
  return <main>
    <section className="hero-shell">
      <Header />
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span/>PRINT, MADE PERSONAL</div>
          <h1>Big ideas.<br/><em>Sharp</em> print.</h1>
          <p>Configure it, make it yours, and approve it online. Production-ready print without the back-and-forth.</p>
          <div className="hero-actions"><Link href="#products" className="button button-primary">Start a project <MoveRight size={18}/></Link><Link href="#work" className="text-link">See what we make <ArrowDown size={16}/></Link></div>
          <div className="trust-row"><span><Zap size={16}/> Instant pricing</span><span><ShieldCheck size={16}/> Proof before print</span><span><Sparkles size={16}/> Made in-house</span></div>
        </div>
        <div className="hero-art" aria-label="Assorted custom print products">
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="art-card card-sticker"><span>GOOD<br/>THINGS</span><small>STICK AROUND</small></div>
          <div className="art-card card-bib"><b>042</b><span>TRAIL<br/>SERIES</span></div>
          <div className="art-card card-board"><small>RIDGE RUN</small><b>27</b><span>KEEP MOVING</span></div>
          <div className="art-card card-tag">DH<span>MADE TO MATTER</span></div>
          <div className="spec-note note-one">Weatherproof<br/><b>stock</b></div>
          <div className="spec-note note-two">Variable data<br/><b>ready</b></div>
        </div>
      </div>
    </section>

    <section className="product-section" id="products">
      <div className="section-heading"><div><span className="eyebrow dark"><span/>PICK YOUR FORMAT</span><h2>What are we<br/>making today?</h2></div><p>Six specialist print divisions. One simple way to bring your idea to life.</p></div>
      <div className="product-grid">
        {products.map((p) => <Link href={`/configure/${p.slug}`} className="product-tile" style={{'--accent': p.accent}} key={p.slug}>
          <div className="tile-top"><span>{p.code}</span><ArrowUpRight size={20}/></div>
          <ProductMark shape={p.shape}/><div><h3>{p.name}</h3><p>{p.description}</p></div>
        </Link>)}
      </div>
    </section>

    <section className="process-section">
      <div className="process-intro"><span className="eyebrow"><span/>HOW IT WORKS</span><h2>From screen to<br/><em>shop floor.</em></h2><p>No mystery quote forms. No endless email chains. Just three clean steps.</p></div>
      <div className="process-list">
        {[['01','Configure','Choose size, stock and quantity. Your price updates as you go.'],['02','Make it yours','Use a template, upload finished art, or build a design in the studio.'],['03','Approve & print','Review a true-to-size proof. We only produce what you approve.']].map(([n,t,d]) => <div className="process-step" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}
      </div>
    </section>

    <section className="work-section" id="work">
      <div className="section-heading compact"><div><span className="eyebrow dark"><span/>FRESH OFF THE PRESS</span><h2>Made for real life.</h2></div><Link href="#products" className="text-link dark-link">Make something like this <MoveRight size={16}/></Link></div>
      <div className="work-grid"><div className="work-shot shot-one"><span className="shot-label">MTB BOARDS / DURBAN</span><div className="board-stack">84<small>ENDURO</small></div></div><div className="work-shot shot-two"><span className="shot-label">PRODUCT LABELS / CAPE TOWN</span><div className="jar-label">SLOW<br/>GROWN<small>SMALL BATCH</small></div></div><div className="work-shot shot-three"><span className="shot-label">RACE NUMBERS / JOBURG</span><div className="bib-stack">118<small>NIGHT RUN</small></div></div></div>
    </section>

    <section className="about-section" id="about"><div><span className="eyebrow"><span/>ABOUT DIGITAL HEROES</span><h2>Print expertise,<br/><em>without the friction.</em></h2></div><div><p>Digital Heroes brings configuration, artwork, proofing and order tracking into one clear customer journey. Every project stays connected from first idea to finished production.</p><div className="about-points"><article><b>Configure</b><span>Production-ready options and instant demo pricing.</span></article><article><b>Create</b><span>Design online or upload finished artwork.</span></article><article><b>Approve</b><span>Review the exact proof before anything prints.</span></article></div></div></section>

    <section className="contact-section" id="contact"><div><span className="eyebrow dark"><span/>CONTACT THE STUDIO</span><h2>Have a print question?</h2><p>Tell us what you are making and the studio will help you choose the right route.</p></div><div className="contact-card"><span>GENERAL ENQUIRIES</span><a href="mailto:hello@digitalheroes.co.in">hello@digitalheroes.co.in</a><p>Monday–Friday · 09:00–17:00 IST</p><Link className="journey-button primary" href="/#products">Start with a product</Link></div></section>

    <footer><div className="brand footer-brand"><span className="brand-glyph">DH</span><span>Digital<br/>Heroes</span></div><h2>Make your mark.</h2><Link href="#products" className="button button-lime">Start a project <MoveRight size={18}/></Link><div className="footer-line"><span>© 2026 Digital Heroes</span><span>Print, built differently.</span><span>hello@digitalheroes.co.in</span></div></footer>
  </main>;
}

