# TimeFlies App

A comprehensive order management system for clock businesses with real-time synchronization from TiendaNube.

## Features

### Order Management
- **Real-time Order Sync**: Automatically syncs orders from TiendaNube
- **Advanced Filtering**: Filter orders by status, date, customer, and more
- **Order Inspection**: Click on any order row to inspect details inline
- **URL-based Order Inspection**:
  - Navigate directly to `/orders?order=ORDER_ID` to inspect a specific order
  - Navigate to `/orders/ORDER_ID` to automatically redirect and inspect an order
  - URL updates automatically when inspecting orders, making it shareable and bookmarkable
  - Invalid order IDs are automatically cleaned from the URL

### Analytics & Reporting
- Revenue tracking with profit margins
- Order statistics and trends
- Product performance analytics

### Customer Management
- Customer information and order history
- Contact details and shipping addresses

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Order Inspection URLs

The orders page supports direct URL access for order inspection:

- **Query Parameter**: `/orders?order=ORDER_ID` - Inspects the specified order
- **Dynamic Route**: `/orders/ORDER_ID` - Redirects to the query parameter format
- **Automatic URL Updates**: When you click on an order row, the URL updates to reflect the inspected order
- **Shareable Links**: You can share URLs with order IDs to directly inspect specific orders
- **Invalid ID Handling**: If an invalid order ID is provided, it's automatically removed from the URL

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Convex (real-time database)
- **Styling**: Tailwind CSS, shadcn/ui components
- **E-commerce Integration**: TiendaNube API

## Development

- **Type Checking**: `npx tsc --noEmit`
- **Linting**: `npm run lint`
- **Build**: `npm run build`
