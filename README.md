# Shazo Admin Dashboard 🚖🌟

The Shazo Admin Dashboard is an elegant, high-performance web dashboard built with React, Vite, TypeScript, and Tailwind CSS. It is designed to serve as the unified administrative panel for managing ride-hailing services, emergency ambulance dispatches, and restaurant/food delivery systems in Karachi.

---

## 🏗️ Product Features
- **Karachi Dispatch Control**: Real-time dispatch operations, unassigned bookings logs, and coordinate trackers.
- **Rider Management**: Audit rider credentials, vehicle registrations, service toggles, and ledger balances.
- **Restaurant Partners**: Audit restaurant operating licenses, menu listings, working hours, and settlement ledger balances.
- **Emergency Medical Fleet**: High-contrast tracking panel for managing emergency ambulance services.
- **Finance and Ledger Review**: Review manual payment top-up requests, verify transfers, and adjust driver/restaurant wallets.

---

## ⚙️ Primary Production Environment Settings

Prepare your deployment environment by initializing the following keys in your `.env` or configurations panel (refer to `.env.example` as a template guide):

```env
VITE_API_BASE_URL=https://app.shazoride.com
VITE_MAPS_API_KEY=replace_with_shazo_frontend_maps_key
VITE_APP_NAME=Shazo Admin
VITE_DEFAULT_CITY=Karachi
VITE_DEFAULT_CURRENCY=PKR
```

- **API Base URL**: `https://app.shazoride.com`
- **Admin Frontend URL**: `https://admin.shazoride.com`

---

## 🚀 Commands & Local Development

To run the application locally or compile the static assets:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

3. **Validate TypeScript / Linting**:
   ```bash
   npm run lint
   ```

4. **Compile Production App**:
   ```bash
   npm run build
   ```

---

## 🐳 Coolify / Production Deployment

This project supports standard static site deployment, or containerized deployments using the included `Dockerfile` with Nginx for proxying SPA routing.

### Static / Coolify Deployment Options:
- **Build Provider**: Dockerfile (Multi-stage alpine template) or static Nixpacks/static deployment.
- **Nginx Configuration**: Configured to serve `index.html` fallback for single-page applications under `/etc/nginx/conf.d/default.conf`.
- **Target Port**: `80` (Standard HTTP ingress container routing)
