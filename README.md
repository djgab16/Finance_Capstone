# ARCMS — Accounts Receivable & Collection Monitoring System

A modern web-based AR & collection monitoring system for freight & logistics
operators. ARCMS replaces manual ledger-keeping with structured tools for
managing client accounts, invoices, payments (Official Receipts), aging
analysis, and reports.

Built with React 19, TypeScript, Vite, react-router-dom v7, lucide-react,
and recharts. All data is mocked in `src/data/mockData.ts` and persisted
in `localStorage` under the `arcms_*` namespace — no backend required.

## Features

- **Client Account Management** — register clients, maintain billing profiles, view per-client receivable history.
- **Billing & Invoices** — create invoices with auto-computed VAT (12%) and overdue surcharge (5%).
- **Payment Collection** — record payments against invoices, generate Official Receipt (OR) numbers, track outstanding balances and payment status (Paid / Unpaid / Partially Paid / Overdue).
- **Aging Monitoring** — bucket receivables (Current, 1-30, 31-60, 61-90, 90+) with chart + detailed report.
- **Reports** — AR Report, Collection Summary, and Aging Report with browser print + CSV export.
- **Role-Based Access** — `ADMIN` and `OP. TEAM` roles with module-level gating.
- **Audit Logging** — activity logs for invoice/payment/client mutations.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`).

Use any of the sample credentials below — password is `password123`:

| ID        | Name                     | Role      |
| --------- | ------------------------ | --------- |
| EMP-001   | Taromaru Rex Gabriel     | ADMIN     |
| EMP-002   | John Angelo M. Reveche   | OP. TEAM  |
| EMP-003   | Conag, Reca M.           | OP. TEAM  |
| EMP-004   | David Jr. M. Gabriel     | OP. TEAM  |

## Build

```bash
npm run build
```

## Project structure

- `src/types.ts` — shared domain types (Client, Invoice, Payment, etc.)
- `src/data/mockData.ts` — seed data
- `src/utils/finance.ts` — VAT/surcharge computation, aging, formatting, CSV export
- `src/context/` — Data + Auth providers (localStorage-backed)
- `src/pages/` — feature modules (Invoices, Clients, Payments, Aging, Reports, ...)
- `src/components/` — shared UI primitives (StatCard, DataTable, StatusBadge, Sidebar, Header, ...)
