'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Download, FileCheck2, ImagePlus, Minus, Plus, ShoppingBag, Type, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Header from './Header';
import { LoadingOverlay } from './LoadingState';
import { calculatePrice } from '@/lib/data';
import { addCartItem } from '@/redux/slices/cartSlice';
import {
  initializeConfigurator,
  setApproved,
  setArtworkName,
  setDesignMethod,
  setHeight,
  setMaterial,
  setQuantity,
  setStep,
  setTemplateId,
  setWidth,
} from '@/redux/slices/configuratorSlice';
import {
  clearDesignValidation,
  createDraftDesign,
  fetchDesignById,
  uploadDesignFile,
} from '@/redux/slices/designsSlice';
import { fetchPrice, setEstimatedPrice } from '@/redux/slices/pricingSlice';

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(value || 0);

const placeholderEntries = (template) => Object.entries(
  template?.placeholderRules?.placeholders || {},
);

function TemplateCanvas({ imagePreviews, scale, svgRef, template, values }) {
  const [backgroundFailed, setBackgroundFailed] = useState(false);

  useEffect(() => {
    setBackgroundFailed(false);
  }, [template?.id, template?.thumbnailPath]);

  if (!template) {
    return <div className="api-canvas-empty">No active template is available for this product.</div>;
  }

  const canvasWidth = Number(template.canvasWidth) || 240;
  const canvasHeight = Number(template.canvasHeight) || 180;
  const safeArea = template.safeArea || {
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
  };

  return (
    <div
      className="api-canvas-shell"
      style={{
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        transform: `scale(${scale})`,
      }}
    >
      <svg
        ref={svgRef}
        className="api-template-canvas"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        role="img"
        aria-label={`${template.name} product template preview`}
      >
        <rect width={canvasWidth} height={canvasHeight} fill="#ffffff" />
        {template.thumbnailPath && !backgroundFailed && (
          <image
            href={template.thumbnailPath}
            x="0"
            y="0"
            width={canvasWidth}
            height={canvasHeight}
            preserveAspectRatio="none"
            onError={() => setBackgroundFailed(true)}
          />
        )}
        {backgroundFailed && (
          <g className="api-background-fallback">
            <rect x="0" y="0" width={canvasWidth} height={canvasHeight} />
            <text x={canvasWidth / 2} y={canvasHeight / 2} textAnchor="middle" dominantBaseline="middle">
              Template background unavailable
            </text>
          </g>
        )}
        <rect
          className="api-safe-area"
          x={safeArea.x}
          y={safeArea.y}
          width={safeArea.width}
          height={safeArea.height}
        />
        {placeholderEntries(template).map(([key, rule]) => {
          const bounds = rule.bounds || {};
          if (rule.type === 'image') {
            return imagePreviews[key] ? (
              <image
                key={key}
                href={imagePreviews[key]}
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                preserveAspectRatio={rule.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
              />
            ) : (
              <g key={key} className="api-image-placeholder">
                <rect
                  x={bounds.x}
                  y={bounds.y}
                  width={bounds.width}
                  height={bounds.height}
                />
                <text
                  x={(bounds.x || 0) + (bounds.width || 0) / 2}
                  y={(bounds.y || 0) + (bounds.height || 0) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(5, Math.max(3, Number(bounds.height || 20) * 0.3))}
                >
                  {rule.label}
                </text>
              </g>
            );
          }

          const style = rule.style || {};
          const align = style.textAlign || 'center';
          const textAnchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
          const x = align === 'left'
            ? bounds.x
            : align === 'right'
              ? (bounds.x || 0) + (bounds.width || 0)
              : (bounds.x || 0) + (bounds.width || 0) / 2;

          return (
            <text
              key={key}
              x={x}
              y={(bounds.y || 0) + (bounds.height || 0) / 2}
              fill={style.color || '#111317'}
              fontFamily={style.fontFamily || 'Arial'}
              fontSize={style.fontSize || 16}
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {values[key] || rule.label}
            </text>
          );
        })}
      </svg>
      <span className="api-canvas-size">{canvasWidth} × {canvasHeight} mm</span>
    </div>
  );
}

export default function ProductStudio({ product, designId = null }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const stored = useSelector((state) => state.configurator);
  const pricing = useSelector((state) => state.pricing);
  const designs = useSelector((state) => state.designs);
  const cart = useSelector((state) => state.cart);
  const previewSvgRef = useRef(null);
  const templates = (product.configurationSchema?.templates || []).filter(
    (template) => template.active !== false,
  );
  const materialNames = product.configurationSchema?.materials?.length
    ? product.configurationSchema.materials
    : [product.material];
  const materialOptions = materialNames.map((name, index) => ({
    name,
    multiplier: Number((1 + index * 0.12).toFixed(2)),
  }));
  const firstTemplate = templates[0] || null;
  const defaults = {
    productSlug: product.slug,
    step: 1,
    width: product.defaultWidth,
    height: product.defaultHeight,
    quantity: Math.max(product.minQty, 50),
    material: materialOptions[0]?.multiplier || 1,
    designText: '',
    designMethod: 'online',
    templateId: firstTemplate?.id || '',
    fontFamily: 'Arial',
    designColor: '#111317',
    logoName: '',
    artworkName: '',
    rotation: 0,
    scale: 1,
    approved: false,
  };
  const config = stored.productSlug === product.slug ? stored : defaults;
  const {
    step,
    width,
    height,
    quantity,
    material,
    designMethod,
    templateId,
    artworkName,
    scale,
    approved,
  } = config;
  const selectedTemplate = templates.find((template) => template.id === templateId) || firstTemplate;
  const [placeholderValues, setPlaceholderValues] = useState({});
  const [uploadedMedia, setUploadedMedia] = useState({});
  const [uploadedArtwork, setUploadedArtwork] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({});
  const [placeholderErrors, setPlaceholderErrors] = useState({});
  const localPrice = useMemo(
    () => calculatePrice(product, width, height, quantity, material),
    [product, width, height, quantity, material],
  );
  const price = pricing.price || localPrice;

  useEffect(() => {
    dispatch(initializeConfigurator(defaults));
    dispatch(clearDesignValidation());
    if (designId) dispatch(fetchDesignById(designId));
  }, [designId, dispatch, product.slug]);

  useEffect(() => {
    const design = designs.current;
    if (!designId || !design || design.id !== designId) return;

    const layers = Array.isArray(design.designData?.layers) ? design.designData.layers : [];
    const savedConfiguration = design.designData?.configuration || {};
    const artworkLayer = layers.find((layer) => layer.key === 'artwork');
    const restoredValues = {};
    const restoredMedia = {};
    const restoredPreviews = {};

    layers.forEach((layer) => {
      if (!layer.key) return;
      if (layer.type === 'image' && layer.value) {
        restoredMedia[layer.key] = {
          signedUrl: layer.value,
          originalName: layer.label || layer.key,
          mimeType: 'image/*',
        };
        restoredPreviews[layer.key] = layer.value;
      } else if (layer.type === 'text') {
        restoredValues[layer.key] = layer.value || '';
      }
    });

    if (design.templateId) dispatch(setTemplateId(design.templateId));
    if (savedConfiguration.width) dispatch(setWidth(savedConfiguration.width));
    if (savedConfiguration.height) dispatch(setHeight(savedConfiguration.height));
    if (savedConfiguration.quantity) dispatch(setQuantity(savedConfiguration.quantity));
    if (savedConfiguration.materialMultiplier) dispatch(setMaterial(savedConfiguration.materialMultiplier));

    const restoredMethod = savedConfiguration.designMethod
      || (artworkLayer || design.sourceFilePath ? 'upload' : 'online');
    dispatch(setDesignMethod(restoredMethod));
    dispatch(setApproved(false));
    dispatch(setStep(3));
    setPlaceholderValues(restoredValues);
    setUploadedMedia(restoredMedia);
    setImagePreviews(restoredPreviews);

    if (restoredMethod === 'upload') {
      const signedUrl = artworkLayer?.value || design.sourceFilePath;
      if (signedUrl) {
        const originalName = design.name || artworkLayer?.label || 'Uploaded artwork';
        setUploadedArtwork({
          signedUrl,
          originalName,
          mimeType: artworkLayer?.type === 'image' ? 'image/*' : 'application/pdf',
        });
        dispatch(setArtworkName(originalName));
      }
    }
  }, [designId, designs.current, dispatch]);

  useEffect(() => {
    const nextValues = {};
    placeholderEntries(selectedTemplate).forEach(([key, rule]) => {
      nextValues[key] = placeholderValues[key]
        ?? (key === 'raceNumber' ? '042' : rule.type === 'text' ? '' : '');
    });
    setPlaceholderValues(nextValues);
    setPlaceholderErrors({});
  }, [selectedTemplate?.id]);

  useEffect(() => {
    dispatch(setEstimatedPrice(localPrice));
    let request;
    const timer = setTimeout(() => {
      request = dispatch(fetchPrice({
        productSlug: product.slug,
        width,
        height,
        quantity,
        materialMultiplier: material,
      }));
    }, 250);
    return () => {
      clearTimeout(timer);
      request?.abort();
    };
  }, [dispatch, product.slug, width, height, quantity, material, localPrice]);

  function updatePlaceholder(key, value) {
    setPlaceholderValues((current) => ({ ...current, [key]: value }));
    setPlaceholderErrors((current) => ({ ...current, [key]: null }));
  }

  function selectTemplate(template) {
    dispatch(setTemplateId(template.id));
    setUploadedMedia({});
    setImagePreviews({});
  }

  async function selectImage(key, rule, file) {
    if (!file) return;
    const acceptedTypes = rule.validation?.acceptedTypes || [];
    const maxSize = rule.validation?.maxSizeBytes;
    if (acceptedTypes.length && !acceptedTypes.includes(file.type)) {
      setPlaceholderErrors((current) => ({
        ...current,
        [key]: `Use ${acceptedTypes.map((type) => type.split('/')[1]).join(', ')} files.`,
      }));
      return;
    }
    if (maxSize && file.size > maxSize) {
      setPlaceholderErrors((current) => ({
        ...current,
        [key]: `File must be smaller than ${Math.round(maxSize / 1024 / 1024)} MB.`,
      }));
      return;
    }
    const result = await dispatch(uploadDesignFile({ file, category: 'artwork' }));
    if (uploadDesignFile.fulfilled.match(result)) {
      setUploadedMedia((current) => ({ ...current, [key]: result.payload }));
      setImagePreviews((current) => ({ ...current, [key]: result.payload.signedUrl }));
      setPlaceholderErrors((current) => ({ ...current, [key]: null }));
    } else {
      setPlaceholderErrors((current) => ({
        ...current,
        [key]: result.payload || 'Unable to upload this file.',
      }));
    }
  }

  async function selectArtworkFile(file) {
    if (!file) return;
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    if (!acceptedTypes.includes(file.type)) {
      setPlaceholderErrors((current) => ({
        ...current,
        artwork: 'Use a PNG, JPEG, WebP or PDF file.',
      }));
      return;
    }
    if (file.size > 10485760) {
      setPlaceholderErrors((current) => ({
        ...current,
        artwork: 'File must be smaller than 10 MB.',
      }));
      return;
    }
    const result = await dispatch(uploadDesignFile({ file, category: 'artwork' }));
    if (uploadDesignFile.fulfilled.match(result)) {
      setUploadedArtwork(result.payload);
      dispatch(setArtworkName(result.payload.originalName || file.name));
      setPlaceholderErrors((current) => ({ ...current, artwork: null }));
    } else {
      setUploadedArtwork(null);
      setPlaceholderErrors((current) => ({
        ...current,
        artwork: result.payload || 'Unable to upload this file.',
      }));
    }
  }

  function validateTemplateFields() {
    const errors = {};
    placeholderEntries(selectedTemplate).forEach(([key, rule]) => {
      const value = String(placeholderValues[key] || '').trim();
      const hasValue = rule.type === 'image' ? Boolean(uploadedMedia[key]?.signedUrl) : Boolean(value);
      if (rule.required && !hasValue) errors[key] = `${rule.label} is required.`;
      if (rule.type === 'text' && value) {
        if (rule.validation?.maxLength && value.length > rule.validation.maxLength) {
          errors[key] = `Maximum ${rule.validation.maxLength} characters.`;
        }
        if (rule.validation?.pattern && !new RegExp(rule.validation.pattern).test(value)) {
          errors[key] = `${rule.label} has an invalid format.`;
        }
      }
    });
    setPlaceholderErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const firstText = placeholderEntries(selectedTemplate).find(([key, rule]) =>
    key === 'raceNumber' || (rule.type === 'text' && rule.required),
  ) || placeholderEntries(selectedTemplate).find(([, rule]) => rule.type === 'text');
  const displayText = firstText ? placeholderValues[firstText[0]] : '';
  const designLayers = designMethod === 'online'
    ? placeholderEntries(selectedTemplate)
      .map(([key, rule]) => ({
        key,
        ...rule,
        value: rule.type === 'image'
          ? uploadedMedia[key]?.signedUrl || ''
          : String(placeholderValues[key] || '').trim(),
      }))
    : uploadedArtwork?.signedUrl
      ? [{
        key: 'artwork',
        type: uploadedArtwork.mimeType?.startsWith('image/') ? 'image' : 'file',
        label: 'Uploaded artwork',
        fit: 'contain',
        bounds: {
          x: 0,
          y: 0,
          unit: 'mm',
          width: selectedTemplate?.canvasWidth || width,
          height: selectedTemplate?.canvasHeight || height,
        },
        required: true,
        validation: {
          maxSizeBytes: 10485760,
          acceptedTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
        },
        value: uploadedArtwork.signedUrl,
      }]
      : [];
  const designPayload = {
    productId: product.id,
    templateId: selectedTemplate?.id,
    name: `${selectedTemplate?.name || product.short}${displayText ? ` ${displayText}` : ''}`,
    designData: {
      layers: designLayers,
      configuration: {
        width,
        height,
        quantity,
        materialMultiplier: material,
        material: materialOptions.find((option) => option.multiplier === material)?.name || product.material,
        designMethod,
      },
    },
    ...(designMethod === 'upload' && uploadedArtwork?.signedUrl
      ? { sourceFilePath: uploadedArtwork.signedUrl }
      : {}),
    status: 'draft',
  };

  function triggerDownload(href, filename) {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function downloadPreview() {
    const safeName = `${product.slug}-${designs.current?.id || 'preview'}`;
    if (designMethod === 'online' && previewSvgRef.current) {
      const source = new XMLSerializer().serializeToString(previewSvgRef.current);
      const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>${source}`], { type: 'image/svg+xml' });
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, `${safeName}.svg`);
      URL.revokeObjectURL(objectUrl);
      return;
    }

    if (uploadedArtwork?.signedUrl) {
      try {
        const response = await fetch(uploadedArtwork.signedUrl);
        if (!response.ok) throw new Error('Preview download failed.');
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl, uploadedArtwork.originalName || `${safeName}.${blob.type.split('/')[1] || 'file'}`);
        URL.revokeObjectURL(objectUrl);
      } catch {
        triggerDownload(uploadedArtwork.signedUrl, uploadedArtwork.originalName || `${safeName}-artwork`);
      }
    }
  }

  async function continueJourney() {
    if (step === 1) {
      dispatch(setStep(2));
      return;
    }
    if (step === 2) {
      if (designMethod === 'online' && !validateTemplateFields()) return;
      if (designMethod === 'upload' && !uploadedArtwork?.signedUrl) {
        setPlaceholderErrors({ artwork: 'Upload production artwork before continuing.' });
        return;
      }
      const result = await dispatch(createDraftDesign(designPayload));
      if (createDraftDesign.fulfilled.match(result)) {
        dispatch(setStep(3));
        if (result.payload?.id) {
          router.push(`/configure/${product.slug}?designId=${encodeURIComponent(result.payload.id)}`, { scroll: false });
        }
      }
      return;
    }
    if (!approved) return;
    const selectedMaterial = materialOptions.find((option) => option.multiplier === material);
    const result = await dispatch(addCartItem({
      productSlug: product.slug,
      width,
      height,
      quantity,
      material: selectedMaterial?.name || product.material || 'standard',
      materialMultiplier: material,
      configuration: {
        designId: designs.current?.id,
        designName: designs.current?.name || designPayload.name,
        templateId: selectedTemplate?.id,
        designData: designs.current?.designData || designPayload.designData,
        designText: displayText,
        designMethod,
        artworkName,
        previewUrl: uploadedArtwork?.signedUrl || selectedTemplate?.thumbnailPath || '',
        accent: product.accent,
      },
    }));
    if (addCartItem.fulfilled.match(result)) router.push('/cart');
  }

  const busy = designs.saveStatus === 'loading'
    || designs.currentStatus === 'loading'
    || designs.uploadStatus === 'loading'
    || cart.mutationStatus === 'loading';
  const stages = ['Configure', 'Personalise', 'Review proof'];
  const proofLayers = (designs.current?.designData?.layers || designLayers)
    .filter((layer) => Boolean(layer.value));
  const selectedMaterialName = materialOptions.find((option) => option.multiplier === material)?.name
    || product.material
    || 'Standard material';
  const designReference = designs.current?.id
    ? designs.current.id.split('-')[0].toUpperCase()
    : 'PENDING';

  return (
    <main className="studio-page" style={{ '--product-accent': product.accent }}>
      <Header dark />
      <div className="studio-progress">
        <Link href="/#products">Back to products</Link>
        <div>{stages.map((label, index) => (
          <button
            type="button"
            className={step === index + 1 ? 'current' : step > index + 1 ? 'complete' : ''}
            onClick={() => index + 1 < step && dispatch(setStep(index + 1))}
            key={label}
          >
            <span>{step > index + 1 ? <Check /> : null}</span>{label}
          </button>
        ))}</div>
        <small>{pricing.status === 'loading' ? 'Updating priceâ€¦' : 'Live product configuration'}</small>
      </div>
      <div className="studio-layout">
        <section className="studio-controls">
          <span className="studio-kicker">{product.name}</span>
          {step === 1 && (
            <div className="studio-section">
              <h1>Set the print specs.</h1>
              <p>{product.description}</p>
              <div className="spec-card">
                <div className="spec-title"><b>Finished size</b><small>Millimetres</small></div>
                <div className="dimension-grid">
                  <label>Width<input type="number" value={width} min={product.minWidth} max={product.maxWidth} onChange={(event) => dispatch(setWidth(+event.target.value))} /></label>
                  <span>×</span>
                  <label>Height<input type="number" value={height} min={product.minHeight} max={product.maxHeight} onChange={(event) => dispatch(setHeight(+event.target.value))} /></label>
                </div>
                <div className="preset-row">
                  {[[product.defaultWidth, product.defaultHeight], [90, 50], [210, 148]]
                    .filter(([w, h]) => w >= product.minWidth && w <= product.maxWidth && h >= product.minHeight && h <= product.maxHeight)
                    .map(([w, h]) => <button type="button" onClick={() => { dispatch(setWidth(w)); dispatch(setHeight(h)); }} key={`${w}-${h}`}>{w} × {h}</button>)}
                </div>
              </div>
              <div className="spec-card">
                <div className="spec-title"><b>Material</b><small>From product API</small></div>
                <div className="material-grid api-material-grid">
                  {materialOptions.map((option) => (
                    <button type="button" className={material === option.multiplier ? 'selected' : ''} onClick={() => dispatch(setMaterial(option.multiplier))} key={option.name}>
                      <i className="material-dot standard" /><span><b>{option.name}</b><small>Production material</small></span><Check />
                    </button>
                  ))}
                </div>
              </div>
              <div className="spec-card">
                <div className="spec-title"><b>Quantity</b><small>Minimum {product.minQty}</small></div>
                <div className="quantity-stepper">
                  <button type="button" onClick={() => dispatch(setQuantity(Math.max(product.minQty, quantity - 10)))}><Minus /></button>
                  <input type="number" value={quantity} min={product.minQty} onChange={(event) => dispatch(setQuantity(Math.max(product.minQty, +event.target.value)))} />
                  <button type="button" onClick={() => dispatch(setQuantity(quantity + 10))}><Plus /></button><span>units</span>
                </div>
                {price.discount > 0 && <p className="volume-note">Volume discount applied: {price.discount}% per unit.</p>}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="studio-section">
              <h1>Personalise the template.</h1>
              <p>The controls and canvas positions below come directly from this product's template schema.</p>
              <div className="method-switch">
                <button type="button" className={designMethod === 'online' ? 'active' : ''} onClick={() => dispatch(setDesignMethod('online'))}><Type /><span><b>Use a template</b><small>Dynamic product fields</small></span></button>
                <button type="button" className={designMethod === 'upload' ? 'active' : ''} onClick={() => dispatch(setDesignMethod('upload'))}><Upload /><span><b>Upload artwork</b><small>Production-ready file</small></span></button>
              </div>
              {designMethod === 'online' ? (
                <>
                  <div className="control-group">
                    <div className="spec-title"><b>Select a template</b><small>{templates.length} available</small></div>
                    <div className="template-grid api-template-grid">
                      {templates.map((template) => (
                        <button type="button" className={selectedTemplate?.id === template.id ? 'selected' : ''} onClick={() => selectTemplate(template)} key={template.id}>
                          <span style={{ backgroundImage: template.thumbnailPath ? `url(${template.thumbnailPath})` : undefined }}><i>{template.name}</i></span>
                          <b>{template.name}</b>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="control-group api-placeholder-fields">
                    {placeholderEntries(selectedTemplate).map(([key, rule]) => (
                      rule.type === 'image' ? (
                        <label className="file-drop compact" key={key}>
                          <ImagePlus />
                          <span><b>{uploadedMedia[key]?.originalName || (designs.uploadStatus === 'loading' ? 'Uploadingâ€¦' : rule.label)}</b><small>{rule.required ? 'Required' : 'Optional'} · up to {Math.round((rule.validation?.maxSizeBytes || 0) / 1024 / 1024) || 5} MB</small></span>
                          <input type="file" required={rule.required} accept={(rule.validation?.acceptedTypes || []).join(',')} onChange={(event) => selectImage(key, rule, event.target.files?.[0])} />
                          {placeholderErrors[key] && <em className="field-error">{placeholderErrors[key]}</em>}
                        </label>
                      ) : (
                        <label className="studio-label" key={key}>
                          <span><Type />{rule.label}{rule.required && ' *'}</span>
                          <input
                            value={placeholderValues[key] || ''}
                            maxLength={rule.validation?.maxLength}
                            required={rule.required}
                            onChange={(event) => updatePlaceholder(key, event.target.value)}
                          />
                          {rule.validation?.maxLength && <small>{(placeholderValues[key] || '').length}/{rule.validation.maxLength}</small>}
                          {placeholderErrors[key] && <em className="field-error">{placeholderErrors[key]}</em>}
                        </label>
                      )
                    ))}
                  </div>
                </>
              ) : (
                <div className="control-group">
                  <label className="file-drop">
                    <Upload /><span><b>{designs.uploadStatus === 'loading' ? 'Uploadingâ€¦' : artworkName || 'Drop finished artwork here'}</b><small>PNG, JPEG, WebP or PDF · maximum 10 MB</small></span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => selectArtworkFile(event.target.files?.[0])} />
                  </label>
                </div>
              )}
              {placeholderErrors.artwork && <div className="studio-error" role="alert"><span>{placeholderErrors.artwork}</span></div>}
              {designs.uploadError && <div className="studio-error" role="alert"><b>Upload failed</b><span>{designs.uploadError}</span></div>}
              {designs.error && <div className="studio-error" role="alert"><b>Unable to create draft</b><span>{designs.error}</span></div>}
            </div>
          )}
          {step === 3 && (
            <div className="studio-section">
              <h1>Review the proof.</h1>
              <p>Check your product choices and personalised details before approving this design for production.</p>
              <div className="proof-review">
                <section className="proof-review-card">
                  <span className="proof-review-label">Your print specification</span>
                  <div className="proof-product-title">
                    <div><b>{product.name}</b><small>{selectedMaterialName}</small></div>
                    <strong>{quantity}<small>units</small></strong>
                  </div>
                  <dl>
                    <div><dt>Finished size</dt><dd>{width} × {height} mm</dd></div>
                    <div><dt>Design option</dt><dd>{designMethod === 'online' ? selectedTemplate?.name || 'Custom template' : 'Uploaded artwork'}</dd></div>
                  </dl>
                </section>
                <section className="proof-review-card">
                  <span className="proof-review-label">Your personalised details</span>
                  <div className="proof-personalisation">
                    {proofLayers.length > 0 ? proofLayers.map((layer) => (
                      <div key={layer.key || layer.label}>
                        <span>{layer.label || layer.key || 'Artwork'}</span>
                        <strong>{layer.type === 'image' || layer.type === 'file' ? <><ImagePlus />File uploaded</> : layer.value}</strong>
                      </div>
                    )) : <p>No additional personalised details.</p>}
                  </div>
                </section>
                <div className="proof-ready-state">
                  <span><Check /></span>
                  <div><b>Design ready for approval</b><small>Reference #{designReference}</small></div>
                  <em>{designs.current?.status || 'Draft'}</em>
                </div>
              </div>
              <div className="proof-summary">
                <div><b>{product.name}</b><span>{width} × {height} mm · {quantity} units</span></div>
                <div><b>{selectedTemplate?.name || 'Uploaded artwork'}</b><span>{designLayers.map((layer) => layer.value).filter(Boolean).join(' · ') || artworkName}</span></div>
                <div><b>API draft</b><span>{designs.current?.status || 'draft'}{designs.current?.id ? ` · ${designs.current.id}` : ''}</span></div>
              </div>
              <button type="button" className="preview-download" onClick={downloadPreview}><Download />Download preview</button>
              <label className="approval-box"><input type="checkbox" checked={approved} onChange={(event) => dispatch(setApproved(event.target.checked))} /><span><b>I approve this proof for production.</b><small>It will be produced exactly as shown in the preview.</small></span></label>
              {cart.error && <div className="studio-error" role="alert"><b>Unable to add item</b><span>{cart.error}</span></div>}
            </div>
          )}
        </section>
        <section className="studio-preview api-studio-preview">
          {busy && <LoadingOverlay label={designs.uploadStatus === 'loading' ? 'Uploading artwork…' : cart.mutationStatus === 'loading' ? 'Adding to cart…' : designs.currentStatus === 'loading' ? 'Loading design…' : 'Validating design…'} />}
          <div className="preview-head"><span>{selectedTemplate?.name || 'Product canvas'}</span><div><FileCheck2 />Safe area from API</div></div>
          <div className="preview-stage api-preview-stage">
            {designMethod === 'online' ? (
              <TemplateCanvas template={selectedTemplate} values={placeholderValues} imagePreviews={imagePreviews} scale={scale} svgRef={previewSvgRef} />
            ) : (
              <div className="api-upload-preview">{uploadedArtwork?.mimeType?.startsWith('image/') ? <img src={uploadedArtwork.signedUrl} alt={uploadedArtwork.originalName || 'Uploaded artwork'} /> : <><Upload /><b>{artworkName || 'Upload artwork'}</b></>}</div>
            )}
            <span className="bleed-tag">{product.bleedMm || 3} mm bleed</span>
            <span className="safe-tag">Dashed line = safe area</span>
          </div>
          <div className="studio-price">
            <div><small>Total · VAT included</small><b>{money(price.total)}</b><span>{money(price.unit)} each · {quantity} units</span></div>
            <button type="button" onClick={continueJourney} disabled={busy || (step === 3 && !approved)}>{busy ? 'Checkingâ€¦' : step === 1 ? 'Personalise template' : step === 2 ? 'Validate & preview' : <><ShoppingBag />Save & add to cart</>}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
