# Digital Heroes Customer App

Next.js customer storefront for the Digital Heroes web-to-print platform.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

The app runs at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` to the standalone Express backend. Authentication state, orders and live pricing are managed in Redux and all remote data is requested through the backend API; the browser does not connect to Supabase directly.

Set `NEXT_PUBLIC_USE_DEMO_API=true` while the final backend contract is pending. The shared Axios instance then uses the in-app demo adapter for authentication, products, pricing, artwork validation, designs, profile, orders, proofs, invoices and payment. Set it to `false` to send the same domain API calls to `NEXT_PUBLIC_API_URL`.

## Redux structure

```text
redux/
  api/       Shared API client and domain API modules
  slices/    Auth, products, orders, pricing, configurator and cart state
  store/     Redux Toolkit store configuration
```

Application-wide and cross-route state belongs in Redux. Short-lived presentation state that only affects one component, such as opening the mobile menu or showing a password, stays local to that component.

## Included journeys

- Six-division product catalogue
- Parameter-driven product configurator and live demo/API pricing
- Online template editor or production-artwork upload
- Print-area/file-format validation and real-time proof preview
- Saved designs, cart, checkout, demo payment and order confirmation
- Customer login, profile, active proofs, history, invoices and reorder UI
- Responsive mobile and desktop layouts

