# Payment Gateway Simulator

A robust, production-ready Payment Gateway UI built with **Next.js (App Router)**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**. This project simulates a complete payment lifecycle, demonstrating strong frontend fundamentals, clean component architecture, and advanced state management.

## 🚀 Live Demo & Repository
- **Repository:** [GitHub Link](https://github.com/shuklaG8/payment-gateway-nextjs.git)
- **Live Demo:** https://payment-gateway-nextjs-six.vercel.app/

---

## ✨ Features Implemented

### 1. Payment Form & Real-time Validation
- **Real-time Input Validation:** Validates all fields (Name, Card Number, Expiry, CVV, Amount) as the user types or blurs out of the field.
- **Auto-formatting:** Automatically formats card numbers with spaces every 4 digits (`4242 4242 4242 4242`).
- **Dynamic Card Detection:** Instantly detects Visa, Mastercard, or Amex based on the first few digits and displays the corresponding badge.
- **Smart CVV Handling:** Enforces a 4-digit CVV limit for Amex and 3 digits for other card types.
- **Expiry Validation:** Blocks past dates dynamically.
- **Live Card Preview:** A beautiful, responsive card preview that updates in real-time as the user fills out the form.

### 2. Payment Lifecycle & Simulation
- **Full Lifecycle Handling:** Gracefully handles states including `Idle`, `Processing`, `Success`, `Failed`, and `Timeout`.
- **Backend Simulation:** Utilizes a Next.js API Route handler (`/api/pay`) to mock a gateway response with realistic delays and randomized outcomes (60% Success, 25% Failed, 15% Timeout).
- **AbortController Timeout:** The frontend cleanly aborts requests taking longer than 6 seconds to ensure a snappy user experience.

### 3. Advanced Retry Logic & Idempotency
- **Retry Mechanism:** Allows the user up to 3 attempts (1 initial + 2 retries) upon failure or timeout.
- **Strict Idempotency:** Uses `crypto.randomUUID()` generated on the client-side *before* the first attempt. All subsequent retries use the exact same transaction ID to prevent duplicate processing on the backend and duplicate entries in the history.

### 4. Persistent Transaction History
- **LocalStorage Sync:** All completed transactions (Success, Failed, Timeout) are saved to the browser's `localStorage` and persist across page refreshes.
- **Detailed View:** Users can click on any transaction in the history sidebar to view detailed metadata (Timestamp, Cardholder, Attempts, Failure Reason).

### 5. Premium UI/UX & Aesthetics
- Built with modern **Glassmorphism** design principles, dynamic hover states, smooth CSS transitions, and premium gradients.
- Fully responsive across Desktop and Mobile viewports.
- Fully accessible with proper focus management and ARIA attributes linking errors to inputs (`aria-describedby`).

---

## 🏗️ Architectural Decisions

1. **Redux Middleware for Purity:** 
   Modifying `localStorage` inside Redux reducers is an anti-pattern as reducers must remain strictly pure. I implemented a custom `storageMiddleware.ts` that listens for payment completion actions and synchronizes the history to `localStorage` as an explicit side-effect.
   
2. **Next.js Hydration Safety:** 
   Generating a UUID via `crypto.randomUUID()` directly inside a `useState` initializer causes React Hydration errors because the server-rendered UUID will never match the client-rendered UUID. The UUID generation was safely extracted to a client-side submission handler.

3. **Separation of Concerns:**
   Business logic is strictly decoupled from JSX. Validation logic lives in `utils/validators.ts`, API requests and timeout management live in `hooks/usePayment.ts`, and global state is managed by Redux slices.

4. **Client vs Server Components:**
   The Redux `<Provider>` is cleanly wrapped in a dedicated `'use client'` `providers.tsx` file, allowing the main `layout.tsx` to remain a Server Component, adhering to Next.js best practices.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode enabled, zero `any` types used)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS (Vanilla, no component libraries)

---

## 💻 Running Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd payment-gateway
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

*This project was built to demonstrate strong frontend architecture, clean code practices, and attention to UX detail for an engineering interview assignment.*
