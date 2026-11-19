'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Check, FileCheck2, ImagePlus, Minus, Palette, Plus, RotateCw, Save, ShoppingBag, Type, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import { calculatePrice } from '@/lib/data';
import { addToCart } from '@/redux/slices/cartSlice';
import {
  initializeConfigurator,setApproved,setArtworkName,setDesignColor,setDesignMethod,setDesignText,setFontFamily,setHeight,setLogoName,setMaterial,setQuantity,setRotation,setScale,setStep,setTemplateId,setWidth,
} from '@/redux/slices/configuratorSlice';
import { clearDesignValidation,fetchDesignResources,saveCurrentDesign,validateCurrentDesign } from '@/redux/slices/designsSlice';
import { fetchPrice,setEstimatedPrice } from '@/redux/slices/pricingSlice';

const money=(value)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value||0);

export default function CustomerStudio({product}){
  const dispatch=useDispatch();
  const router=useRouter();
  const stored=useSelector((state)=>state.configurator);
  const pricing=useSelector((state)=>state.pricing);
  const designs=useSelector((state)=>state.designs);
  const defaults={productSlug:product.slug,step:1,width:product.slug==='mtb-boards'?240:100,height:product.slug==='mtb-boards'?180:100,quantity:Math.max(product.minQty,50),material:1,designText:'RIDE BOLD',designMethod:'online',templateId:'bold-type',fontFamily:'Arial Black',designColor:'#111317',logoName:'',artworkName:'',rotation:0,scale:1,approved:false};
  const config=stored.productSlug===product.slug?stored:defaults;
  const {step,width,height,quantity,material,designText,designMethod,templateId,fontFamily,designColor,logoName,artworkName,rotation,scale,approved}=config;
  const localPrice=useMemo(()=>calculatePrice(product,width,height,quantity,material),[product,width,height,quantity,material]);
  const price=pricing.price||localPrice;
  const designPayload={productSlug:product.slug,productName:product.name,name:designText||artworkName||`${product.short} design`,method:designMethod,designText,templateId,fontFamily,color:designColor,logoName,artworkName,width,height,rotation,scale};

  useEffect(()=>{dispatch(initializeConfigurator(defaults));dispatch(clearDesignValidation());if(designs.resourceStatus==='idle')dispatch(fetchDesignResources())},[dispatch,product.slug]);
  useEffect(()=>{dispatch(setEstimatedPrice(localPrice));let request;const timer=setTimeout(()=>{request=dispatch(fetchPrice({productSlug:product.slug,width,height,quantity,materialMultiplier:material}))},250);return()=>{clearTimeout(timer);request?.abort()}},[dispatch,product.slug,width,height,quantity,material,localPrice]);

  async function continueJourney(){
    if(step===1){dispatch(setStep(2));return}
    if(step===2){const result=await dispatch(validateCurrentDesign(designPayload));if(validateCurrentDesign.fulfilled.match(result)&&result.payload.valid)dispatch(setStep(3));return}
    if(!approved)return;
    await dispatch(saveCurrentDesign(designPayload));
    dispatch(addToCart({key:`${product.slug}-${Date.now()}`,productSlug:product.slug,productName:product.name,width,height,material,designText,designMethod,artworkName,quantity,unit:price.unit,subtotal:price.subtotal,tax:price.tax,total:price.total,color:product.accent}));
    router.push('/cart');
  }

  const busy=designs.validationStatus==='loading'||designs.saveStatus==='loading';
  const stages=['Configure','Create artwork','Review proof'];
  return <main className="studio-page" style={{'--product-accent':product.accent}}>
    <Header dark/>
    <div className="studio-progress"><Link href="/#products">Back to products</Link><div>{stages.map((label,index)=><button type="button" className={step===index+1?'current':step>index+1?'complete':''} onClick={()=>index+1<step&&dispatch(setStep(index+1))} key={label}><span>{step>index+1?<Check/>:null}</span>{label}</button>)}</div><small>{pricing.status==='loading'?'Updating price…':'Demo studio · auto-saved'}</small></div>
    <div className="studio-layout">
      <section className="studio-controls">
        <span className="studio-kicker">{product.name}</span>
        {step===1&&<div className="studio-section"><h1>Set the print specs.</h1><p>Choose the finished size, production material and quantity. Your volume price updates automatically.</p><div className="spec-card"><div className="spec-title"><b>Finished size</b><small>Millimetres</small></div><div className="dimension-grid"><label>Width<input type="number" value={width} min="20" max="1000" onChange={(event)=>dispatch(setWidth(+event.target.value))}/></label><span>×</span><label>Height<input type="number" value={height} min="20" max="1000" onChange={(event)=>dispatch(setHeight(+event.target.value))}/></label></div><div className="preset-row">{[[90,50],[100,100],[210,148]].map(([w,h])=><button type="button" onClick={()=>{dispatch(setWidth(w));dispatch(setHeight(h))}} key={`${w}-${h}`}>{w} × {h}</button>)}</div></div><div className="spec-card"><div className="spec-title"><b>Material</b><small>Production finish</small></div><div className="material-grid"><button type="button" className={material===1?'selected':''} onClick={()=>dispatch(setMaterial(1))}><i className="material-dot standard"/><span><b>Standard</b><small>{product.material}</small></span><Check/></button><button type="button" className={material===1.22?'selected':''} onClick={()=>dispatch(setMaterial(1.22))}><i className="material-dot premium"/><span><b>Premium</b><small>Enhanced finish</small></span><Check/></button></div></div><div className="spec-card"><div className="spec-title"><b>Quantity</b><small>Minimum {product.minQty}</small></div><div className="quantity-stepper"><button type="button" onClick={()=>dispatch(setQuantity(Math.max(product.minQty,quantity-10)))}><Minus/></button><input type="number" value={quantity} min={product.minQty} onChange={(event)=>dispatch(setQuantity(Math.max(product.minQty,+event.target.value)))}/><button type="button" onClick={()=>dispatch(setQuantity(quantity+10))}><Plus/></button><span>units</span></div>{price.discount>0&&<p className="volume-note">Volume discount applied: {price.discount}% per unit.</p>}</div></div>}
        {step===2&&<div className="studio-section"><h1>Choose how to create.</h1><p>Build online with a template or upload production-ready artwork. Both routes include print-area validation.</p><div className="method-switch"><button type="button" className={designMethod==='online'?'active':''} onClick={()=>{dispatch(setDesignMethod('online'));dispatch(clearDesignValidation())}}><Type/><span><b>Design online</b><small>Templates and editing tools</small></span></button><button type="button" className={designMethod==='upload'?'active':''} onClick={()=>{dispatch(setDesignMethod('upload'));dispatch(clearDesignValidation())}}><Upload/><span><b>Upload artwork</b><small>PDF, SVG, AI or PNG</small></span></button></div>{designMethod==='online'?<><div className="control-group"><div className="spec-title"><b>Select a template</b><small>{designs.resourceStatus==='loading'?'Loading…':'Start with a layout'}</small></div><div className="template-grid">{designs.templates.map((template)=><button type="button" className={templateId===template.id?'selected':''} onClick={()=>{dispatch(setTemplateId(template.id));dispatch(setDesignText(template.preview.replace('\n',' ')))}} key={template.id}><span>{template.preview.split('\n').map((line)=><i key={line}>{line}</i>)}</span><b>{template.name}</b></button>)}</div></div><div className="control-group"><label className="studio-label"><span><Type/>Design text</span><input value={designText} maxLength="24" onChange={(event)=>dispatch(setDesignText(event.target.value))}/><small>{designText.length}/24</small></label><div className="editor-grid"><label><span>Typeface</span><select value={fontFamily} onChange={(event)=>dispatch(setFontFamily(event.target.value))}><option>Arial Black</option><option>Georgia</option><option>Trebuchet MS</option><option>Courier New</option></select></label><label><span>Colour</span><div className="colour-input"><input type="color" value={designColor} onChange={(event)=>dispatch(setDesignColor(event.target.value))}/><b>{designColor}</b></div></label></div><label className="file-drop compact"><ImagePlus/><span><b>{logoName||'Add a logo'}</b><small>PNG or SVG · optional</small></span><input type="file" accept=".png,.svg" onChange={(event)=>dispatch(setLogoName(event.target.files?.[0]?.name||''))}/></label><div className="transform-grid"><label><span>Scale</span><input type="range" min=".65" max="1.35" step=".05" value={scale} onChange={(event)=>dispatch(setScale(+event.target.value))}/></label><label><span>Rotation</span><input type="range" min="-20" max="20" value={rotation} onChange={(event)=>dispatch(setRotation(+event.target.value))}/></label></div></div></>:<div className="control-group"><label className="file-drop"><Upload/><span><b>{artworkName||'Drop finished artwork here'}</b><small>PDF, SVG, AI or PNG · maximum 50 MB</small></span><input type="file" accept=".pdf,.svg,.ai,.png" onChange={(event)=>dispatch(setArtworkName(event.target.files?.[0]?.name||''))}/></label><div className="upload-rules"><span><Check/>Correct file format</span><span><Check/>3 mm bleed recommended</span><span><Check/>Minimum 300 DPI</span></div></div>}{designs.validation&&!designs.validation.valid&&<div className="studio-error" role="alert"><b>Design needs attention</b>{designs.validation.errors.map((error)=><span key={error}>{error}</span>)}</div>}</div>}
        {step===3&&<div className="studio-section"><h1>Review the proof.</h1><p>The demo preflight has checked your artwork. Confirm the details before saving it to your account and cart.</p><div className="proof-summary"><div><b>{product.name}</b><span>{width} × {height} mm · {quantity} units</span></div><div><b>{designMethod==='online'?'Online design':'Uploaded artwork'}</b><span>{designMethod==='online'?designText:artworkName}</span></div></div><div className="validation-list">{designs.validation?.checks?.map((check)=><div className={check.passed?'passed':'failed'} key={check.label}><span>{check.passed?<Check/>:'!'}</span><b>{check.label}</b></div>)}</div><label className="approval-box"><input type="checkbox" checked={approved} onChange={(event)=>dispatch(setApproved(event.target.checked))}/><span><b>I approve this proof for production.</b><small>It will be produced exactly as shown in the preview.</small></span></label></div>}
      </section>
      <section className="studio-preview"><div className="preview-head"><span>Real-time preview</span><div><FileCheck2/>Print area checked</div></div><div className="preview-stage"><div className={`preview-product ${product.shape}`} style={{background:product.accent,transform:`rotate(${rotation}deg) scale(${scale})`}}><div className="preview-safe"><strong style={{fontFamily,color:designColor}}>{designMethod==='upload'?(artworkName?'ARTWORK READY':'UPLOAD ARTWORK'):(designText||'YOUR TEXT')}</strong>{logoName&&<small>{logoName}</small>}<em>DIGITAL HEROES · {String(quantity).padStart(3,'0')}</em></div></div><span className="bleed-tag">3 mm bleed</span><span className="safe-tag">Safe print area</span></div><div className="studio-price"><div><small>Total · VAT included</small><b>{money(price.total)}</b><span>{money(price.unit)} each · {quantity} units</span></div><button type="button" onClick={continueJourney} disabled={busy||(step===3&&!approved)}>{busy?'Checking…':step===1?'Open design studio':step===2?'Validate & preview':<><ShoppingBag/>Save & add to cart</>}</button></div>
      </section>
    </div>
  </main>;
}
