'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight, ImagePlus, Layers3, Minus, Plus, RotateCw, Save, Type, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import { calculatePrice } from '@/lib/data';
import { fetchPrice, setEstimatedPrice } from '@/redux/slices/pricingSlice';
import {
  initializeConfigurator,
  setDesignText as updateDesignText,
  setHeight as updateHeight,
  setMaterial as updateMaterial,
  setQuantity as updateQuantity,
  setApproved as updateApproved,
  setStep as updateStep,
  setWidth as updateWidth,
} from '@/redux/slices/configuratorSlice';
import { addToCart } from '@/redux/slices/cartSlice';

const money = (n) => new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:2}).format(n);

export default function Configurator({ product }) {
  const dispatch = useDispatch();
  const storedPrice = useSelector((state) => state.pricing.price);
  const configurator = useSelector((state) => state.configurator);
  const defaults = {
    productSlug: product.slug,
    step: 1,
    width: product.slug === 'mtb-boards' ? 240 : 100,
    height: product.slug === 'mtb-boards' ? 180 : 100,
    quantity: Math.max(product.minQty, 50),
    material: 1,
    designText: 'RIDE BOLD',
    approved: false,
  };
  const state = configurator.productSlug === product.slug ? configurator : defaults;
  const { step, width, height, quantity, material, designText, approved } = state;
  const setStep = (value) => dispatch(updateStep(value));
  const setWidth = (value) => dispatch(updateWidth(value));
  const setHeight = (value) => dispatch(updateHeight(value));
  const setQuantity = (value) => dispatch(updateQuantity(value));
  const setMaterial = (value) => dispatch(updateMaterial(value));
  const setDesignText = (value) => dispatch(updateDesignText(value));
  useEffect(()=>{
    dispatch(initializeConfigurator(defaults));
  },[dispatch, product.slug]);
  const localPrice = useMemo(() => calculatePrice(product, width, height, quantity, material), [product,width,height,quantity,material]);
  const price = storedPrice || localPrice;
  useEffect(()=>{
    dispatch(setEstimatedPrice(localPrice));
    let request;
    const timer=setTimeout(()=>{
      request=dispatch(fetchPrice({productSlug:product.slug,width,height,quantity,materialMultiplier:material}));
    },250);
    return()=>{clearTimeout(timer);request?.abort()};
  },[dispatch, product.slug, width, height, quantity, material, localPrice]);
  function continueFlow(){
    if(step<3){setStep(step+1);return}
    if(!approved)return;
    dispatch(addToCart({
      key:`${product.slug}-${width}-${height}-${material}-${designText}`,
      productSlug:product.slug,
      productName:product.name,
      width,
      height,
      material,
      designText,
      quantity,
      total:price.total,
    }));
  }
  const stages = ['Configure','Design','Proof'];
  return <main className="config-page" style={{'--product-accent':product.accent}}>
    <Header dark/>
    <div className="config-progress"><Link href="/#products"><ChevronLeft size={18}/> Back to products</Link><div>{stages.map((s,i)=><span className={step >= i+1 ? 'active':''} key={s}><b>{i+1}</b>{s}</span>)}</div><small>Saved just now</small></div>
    <div className="config-layout">
      <section className="config-panel">
        <span className="eyebrow dark"><span/>STEP {step} OF 3</span>
        {step === 1 && <>
          <h1>Configure your<br/>{product.short.toLowerCase()}.</h1><p className="lead">Set the production specs. Pricing updates instantly — no quote required.</p>
          <div className="form-stack">
            <fieldset><legend>Size <small>millimetres</small></legend><div className="size-row"><label>Width<input type="number" min="20" max="1000" value={width} onChange={e=>setWidth(+e.target.value)}/><span>mm</span></label><b>×</b><label>Height<input type="number" min="20" max="1000" value={height} onChange={e=>setHeight(+e.target.value)}/><span>mm</span></label></div><div className="quick-sizes">{[[90,50],[100,100],[210,148]].map(([w,h])=><button onClick={()=>{setWidth(w);setHeight(h)}} key={`${w}-${h}`}>{w} × {h}</button>)}</div></fieldset>
            <fieldset><legend>Material</legend><div className="option-grid"><button className={material===1?'selected':''} onClick={()=>setMaterial(1)}><span className="swatch matte"/><b>Standard</b><small>{product.material}</small><Check size={16}/></button><button className={material===1.22?'selected':''} onClick={()=>setMaterial(1.22)}><span className="swatch premium"/><b>Premium</b><small>Enhanced finish</small><Check size={16}/></button></div></fieldset>
            <fieldset><legend>Quantity</legend><div className="quantity-control"><button onClick={()=>setQuantity(Math.max(product.minQty,quantity-10))}><Minus size={17}/></button><input type="number" value={quantity} min={product.minQty} onChange={e=>setQuantity(Math.max(product.minQty,+e.target.value))}/><button onClick={()=>setQuantity(quantity+10)}><Plus size={17}/></button><span>units</span></div>{price.discount>0&&<p className="discount-note">Volume price unlocked — you save {price.discount}% per unit.</p>}</fieldset>
          </div>
        </>}
        {step === 2 && <>
          <h1>Make it<br/>unmistakably yours.</h1><p className="lead">Everything stays inside the safe print area. What you see is what goes to proof.</p>
          <div className="design-tools"><button className="active"><Type size={18}/><span>Add text</span></button><button><ImagePlus size={18}/><span>Add logo</span></button><button><Upload size={18}/><span>Upload art</span></button><button><Layers3 size={18}/><span>Layers</span></button></div>
          <label className="input-label">Headline<input value={designText} onChange={e=>setDesignText(e.target.value.slice(0,18))}/><span>{designText.length}/18</span></label>
          <div className="style-controls"><label>Typeface<select><option>Space Grotesk</option><option>Inter</option><option>Serif Display</option></select></label><label>Colour<div className="color-choice"><span style={{background:product.accent}}/>#{product.accent.slice(1)}</div></label></div>
          <button className="upload-zone"><Upload/><b>Upload finished artwork</b><small>PDF, SVG, AI or PNG · 50 MB max</small></button>
        </>}
        {step === 3 && <>
          <h1>Check every<br/>last detail.</h1><p className="lead">This is proof v1. Confirm the specs and approve it to unlock your production file.</p>
          <div className="proof-checklist"><div><Check/><span><b>Artwork is inside the safe area</b><small>No content will be clipped</small></span></div><div><Check/><span><b>Images are print resolution</b><small>Minimum 300 DPI</small></span></div><div><Check/><span><b>Text and numbers are correct</b><small>Spelling checked</small></span></div></div>
          <label className="approval-check"><input type="checkbox" checked={approved} onChange={(event)=>dispatch(updateApproved(event.target.checked))}/><span>I approve this proof for production and understand it will be printed as shown.</span></label>
        </>}
      </section>
      <section className="preview-panel">
        <div className="preview-toolbar"><span>Live preview</span><div><button><ZoomOut size={17}/></button><b>72%</b><button><ZoomIn size={17}/></button><button><RotateCw size={17}/></button></div></div>
        <div className="design-canvas"><div className="ruler top-ruler"/><div className="ruler side-ruler"/><div className={`print-object ${product.shape}`} style={{'--accent':product.accent}}><div className="safe-zone"><span>{designText || 'YOUR TEXT'}</span><small>DIGITAL HEROES / {String(quantity).padStart(3,'0')}</small></div></div><span className="bleed-note">3 mm bleed</span><span className="safe-note">Safe area</span></div>
        <div className="price-dock"><div><span>Your price <small>VAT included</small></span><b>{money(price.total)}</b><small>{money(price.unit)} per unit · {quantity} units</small></div><button onClick={continueFlow} disabled={step===3&&!approved}>{step===1?'Continue to design':step===2?'Review proof':'Approve & add to cart'}<ChevronRight size={18}/></button></div>
      </section>
    </div>
    <div className="mobile-config-bar"><span><small>Total</small><b>{money(price.total)}</b></span><button onClick={continueFlow} disabled={step===3&&!approved}>{step===3?'Add to cart':'Continue'} <ChevronRight size={17}/></button></div>
  </main>;
}

