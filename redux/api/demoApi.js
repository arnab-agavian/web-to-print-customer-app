const wait = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

const demoProducts = [
  { id:'p-labels',slug:'labels',name:'Labels & Stickers',family:'labels',basePrice:1.8,minQuantity:25,minWidth:20,maxWidth:500,minHeight:20,maxHeight:500,defaultWidth:100,defaultHeight:100,material:'Premium vinyl' },
  { id:'p-race',slug:'race-numbers',name:'Race & Event Numbers',family:'race_numbers',basePrice:3.2,minQuantity:50,minWidth:100,maxWidth:500,minHeight:100,maxHeight:500,defaultWidth:210,defaultHeight:148,material:'Weatherproof stock' },
  { id:'p-mtb',slug:'mtb-boards',name:'MTB Boards',family:'mtb_boards',basePrice:12,minQuantity:10,minWidth:150,maxWidth:500,minHeight:100,maxHeight:400,defaultWidth:240,defaultHeight:180,material:'Polypropylene' },
  { id:'p-stamps',slug:'stamps',name:'Custom Stamps',family:'stamps',basePrice:28,minQuantity:1,minWidth:20,maxWidth:150,minHeight:10,maxHeight:100,defaultWidth:70,defaultHeight:35,material:'Rubber + ink' },
  { id:'p-trophies',slug:'trophies',name:'Trophies & Awards',family:'trophies',basePrice:42,minQuantity:1,minWidth:80,maxWidth:500,minHeight:100,maxHeight:700,defaultWidth:150,defaultHeight:240,material:'Acrylic + timber' },
  { id:'p-laser',slug:'laser-cut',name:'Laser-cut Work',family:'laser_cut',basePrice:18,minQuantity:1,minWidth:20,maxWidth:1000,minHeight:20,maxHeight:1000,defaultWidth:200,defaultHeight:200,material:'Acrylic / timber' },
];

let demoOrders = [
  { id:'order-2052',order_number:'DH-2052',customer_id:'demo-customer',customer_name:'Maya Brooks',product_name:'MTB Boards',product_slug:'mtb-boards',quantity:40,total:486.4,status:'proof',proof_status:'awaiting_approval',created_at:'2026-11-19T04:12:00Z' },
  { id:'order-2048',order_number:'DH-2048',customer_id:'demo-customer',customer_name:'Maya Brooks',product_name:'Labels & Stickers',product_slug:'labels',quantity:250,total:214.2,status:'production',proof_status:'approved',created_at:'2026-11-14T04:12:00Z' },
  { id:'order-1984',order_number:'DH-1984',customer_id:'demo-customer',customer_name:'Maya Brooks',product_name:'Race & Event Numbers',product_slug:'race-numbers',quantity:120,total:354.24,status:'completed',proof_status:'approved',created_at:'2026-10-19T04:12:00Z' },
];

let demoDesigns = [
  { id:'design-good-things',name:'Good Things',productSlug:'labels',productName:'Labels & Stickers',designText:'GOOD THINGS',color:'#ff5c35',updatedAt:'2026-11-12T10:00:00Z' },
  { id:'design-trail-27',name:'Trail 27',productSlug:'mtb-boards',productName:'MTB Boards',designText:'27',color:'#7868ff',updatedAt:'2026-11-04T10:00:00Z' },
];

let profile = { id:'demo-customer',fullName:'Maya Brooks',email:'maya@example.com',phone:'+91 98765 43210',company:'Fieldwork Studio',address:'Indiranagar, Bengaluru, Karnataka' };

const templates = [
  { id:'bold-type',name:'Bold Type',style:'type',preview:'MAKE IT\nMATTER' },
  { id:'race-day',name:'Race Day',style:'race',preview:'042' },
  { id:'minimal-mark',name:'Minimal Mark',style:'minimal',preview:'YOUR\nMARK' },
];

const invoices = [
  { id:'INV-2048',orderNumber:'DH-2048',date:'14 Nov 2026',amount:486.4,status:'Paid' },
  { id:'INV-1984',orderNumber:'DH-1984',date:'19 Oct 2026',amount:354.24,status:'Paid' },
];

const parseData = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return {}; }
  }
  return data;
};

const priceFor = ({ productSlug, width, height, quantity, materialMultiplier = 1 }) => {
  const product = demoProducts.find((item) => item.slug === productSlug) || demoProducts[0];
  const areaFactor = Math.max(.7, (Number(width) * Number(height)) / 10000);
  const multiplier = quantity >= 500 ? .68 : quantity >= 250 ? .76 : quantity >= 100 ? .84 : quantity >= 50 ? .92 : 1;
  const unitPrice = Number((product.basePrice * areaFactor * materialMultiplier * multiplier).toFixed(2));
  const subtotal = Number((unitPrice * quantity).toFixed(2));
  const tax = Number((subtotal * .18).toFixed(2));
  return { unitPrice,subtotal,tax,total:Number((subtotal+tax).toFixed(2)),discountPercent:Math.round((1-multiplier)*100),currency:'INR' };
};

const success = (config, data, status = 200, message = 'Demo request completed.') => ({
  data:{status,success:true,message,response:{data}},status,statusText:'OK',headers:{'x-demo-api':'true'},config,request:null,
});

export async function demoApiAdapter(config) {
  await wait();
  const method = (config.method || 'get').toLowerCase();
  const url = String(config.url || '').split('?')[0];
  const data = parseData(config.data);

  if (url === '/auth/login' && method === 'post') return success(config,{user:{id:'demo-customer',email:data.email,fullName:'Maya Brooks'},session:{accessToken:'demo-access-token',refreshToken:'demo-refresh-token-0000000000',expiresAt:Date.now()/1000+3600},requiresEmailConfirmation:false});
  if (url === '/auth/signup' && method === 'post') return success(config,{user:{id:'demo-customer',email:data.email,fullName:data.fullName},session:{accessToken:'demo-access-token',refreshToken:'demo-refresh-token-0000000000',expiresAt:Date.now()/1000+3600},requiresEmailConfirmation:false},201);
  if (url === '/auth/refresh' && method === 'post') return success(config,{user:{id:'demo-customer',email:profile.email,fullName:profile.fullName},session:{accessToken:'demo-access-token-refreshed',refreshToken:data.refreshToken,expiresAt:Date.now()/1000+3600},requiresEmailConfirmation:false});
  if (url === '/auth/me') return success(config,{user:{id:'demo-customer',email:profile.email,fullName:profile.fullName,role:'customer'}});
  if (url === '/auth/logout') return success(config,{loggedOut:true});
  if (url === '/products' && method === 'get') return success(config,demoProducts);
  if (url === '/products/price' && method === 'post') return success(config,priceFor(data));
  if (url === '/orders' && method === 'get') return success(config,demoOrders);
  if (url === '/orders' && method === 'post') {
    const order={id:`order-${Date.now()}`,order_number:`DH-${String(Date.now()).slice(-4)}`,customer_id:'demo-customer',customer_name:profile.fullName,product_name:data.productName,product_slug:data.productSlug,quantity:data.quantity,total:data.total,status:'order',proof_status:'not_started',created_at:new Date().toISOString(),configuration:data.configuration};
    demoOrders=[order,...demoOrders];return success(config,order,201,'Order created.');
  }
  const reorderMatch=url.match(/^\/orders\/([^/]+)\/reorder$/);
  if(reorderMatch&&method==='post'){const source=demoOrders.find((item)=>item.id===reorderMatch[1])||demoOrders[0];const order={...source,id:`order-${Date.now()}`,order_number:`DH-${String(Date.now()).slice(-4)}`,status:'order',created_at:new Date().toISOString()};demoOrders=[order,...demoOrders];return success(config,order,201);}
  const orderMatch=url.match(/^\/orders\/([^/]+)$/);
  if(orderMatch&&method==='get')return success(config,demoOrders.find((item)=>item.id===orderMatch[1])||demoOrders[0]);
  if (url === '/designs/templates') return success(config,templates);
  if (url === '/designs' && method === 'get') return success(config,demoDesigns);
  if (url === '/designs' && method === 'post') {const design={id:`design-${Date.now()}`,...data,updatedAt:new Date().toISOString()};demoDesigns=[design,...demoDesigns];return success(config,design,201);}
  if (url === '/designs/validate' && method === 'post') {const errors=[];if(data.method==='upload'&&!data.artworkName)errors.push('Upload a PDF, SVG, AI or PNG file.');if(data.method==='online'&&!String(data.designText||'').trim())errors.push('Add text or a logo to your design.');return success(config,{valid:errors.length===0,errors,checks:[{label:'Artwork is inside the safe area',passed:errors.length===0},{label:'File format is production ready',passed:data.method==='online'||/\.(pdf|svg|ai|png)$/i.test(data.artworkName||'')},{label:'Text and numbers are present',passed:Boolean(data.designText)||data.method==='upload'}]});}
  if (url === '/account/profile' && method === 'get') return success(config,profile);
  if (url === '/account/profile' && method === 'patch') {profile={...profile,...data};return success(config,profile);}
  if (url === '/invoices') return success(config,invoices);
  if (url.includes('/proofs/') && url.endsWith('/approve')) return success(config,{approved:true,status:'approved'});
  if (url.includes('/proofs/') && url.endsWith('/change-request')) return success(config,{requested:true,status:'changes_requested',message:data.message});
  if (url === '/payments' && method === 'post') return success(config,{id:`pay-${Date.now()}`,status:'paid',amount:data.amount});
  return success(config,{demo:true,url,method});
}
