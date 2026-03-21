# 1. OBJECTIVE

**NOTE: This plan focuses solely on the Admin Dashboard enhancement. Offline functionality has been removed per user request.**

Transform the /admin page into a comprehensive **Business Management Dashboard** that provides managers with everything they need to run the business efficiently. This includes:

- **Sales Reports**: Generate detailed reports of all sales with paid status, filtered by date range
- **Accounting Management**: Track income, expenses, and profit margins in one place
- **VAT Compliance**: Full integration with existing VAT system for remittance reports
- **Export Functionality**: Generate CSV files with all sales data for any period
- **Financial Overview**: Real-time insights into business performance

**Problem Statement**: The current /admin page shows reservation data and basic POS metrics but lacks comprehensive sales reporting, accounting features, and VAT compliance tools that managers need for day-to-day operations and tax compliance.

# 2. CONTEXT SUMMARY

**Existing Implementations Found:**
- `/lib/actions/vat.actions.ts` - VAT remittance report generation, iTax export
- `/lib/actions/expense.actions.ts` - Expense tracking with VAT categories, input VAT summary
- `/lib/actions/etims.actions.ts` - eTIMS integration for KRA compliance
- `/staging/components/admin/AdminDashboard.tsx` - Current admin dashboard with analytics
- `/staging/components/admin/FixedExportData.tsx` - CSV export for reservations
- `/app/admin/page.tsx` - Main admin page with reservation/POS metrics

**Data Available:**
- Orders with payment status (paid, pending, failed)
- VAT breakdown (standard, zero-rated, exempt)
- Expenses with input VAT
- eTIMS invoice data

**Target Users:**
- Restaurant Managers
- Business Owners
- Accountants/Bookkeepers

# 3. APPROACH OVERVIEW

**Architecture: Unified Business Dashboard**

The admin page will be redesigned as a tabbed/sectioned dashboard:

1. **Dashboard Tab**: Overview with KPIs (existing enhanced)
2. **Sales Reports Tab**: Detailed sales with paid status filtering, CSV export
3. **Accounting Tab**: Income vs Expenses, profit margins, P&L summary
4. **VAT Tab**: VAT reports, remittance generation, iTax export
5. **Expenses Tab**: Expense management, categorization, input VAT tracking

**Technology:**
- Reuse existing `vat.actions.ts` and `expense.actions.ts`
- Create new API routes for filtered sales reports
- Enhance export functionality for orders
- Add date range pickers and filters

# 4. IMPLEMENTATION STEPS

## PHASE 1: Backend API Enhancements

### Step 1.1: Create Sales Reports API (app/api/reports/sales/route.ts)
**Goal**: API endpoint for filtered sales reports
**Method**: 
- Create new API route that accepts date range and filters
- Filter orders by `paymentStatus = 'paid'` by default
- Support custom date ranges
- Include VAT breakdown per order

### Step 1.2: Create Accounting Summary API (app/api/reports/accounting/route.ts)
**Goal**: Combined income/expense report
**Method**:
- Fetch all paid orders for period (income)
- Fetch all paid expenses for period
- Calculate net profit
- Group by category

### Step 1.3: Create Expense Management API (app/api/expenses/route.ts)
**Goal**: CRUD operations for expenses
**Method**:
- GET: List expenses with filters
- POST: Create new expense
- PUT: Update expense
- DELETE: Remove expense

---

## PHASE 2: Frontend Components

### Step 2.1: Create Sales Reports Component (components/reports/SalesReport.tsx)
**Goal**: Display sales with filters and export
**Method**:
- Date range picker
- Status filter (paid, pending, all)
- Table view with order details
- CSV/Excel export buttons
- Summary cards (total sales, VAT, orders count)

### Step 2.2: Create Accounting Dashboard Component (components/reports/AccountingDashboard.tsx)
**Goal**: Financial overview
**Method**:
- Income vs Expense comparison
- Profit margin calculation
- Category breakdown charts
- Period comparison (this month vs last month)

### Step 2.3: Create VAT Management Component (components/reports/VATDashboard.tsx)
**Goal**: VAT compliance hub
**Method**:
- VAT summary cards (output VAT, input VAT, net payable)
- VAT breakdown by category
- Generate remittance report button
- iTax export button
- Filing deadline reminder

### Step 2.4: Create Expenses Management Component (components/reports/ExpensesManager.tsx)
**Goal**: Track and manage expenses
**Method**:
- Expense list with CRUD
- Category filter
- Status filter (pending, paid)
- Add expense modal form

### Step 2.5: Create Report Export Utility (lib/export-utils.ts)
**Goal**: Reusable export functionality
**Method**:
- CSV export for sales
- Excel export option
- JSON export for iTax

---

## PHASE 3: Admin Page Redesign

### Step 3.1: Update /admin/page.tsx
**Goal**: Integrate all components into tabbed interface
**Method**:
- Add navigation tabs (Dashboard, Sales, Accounting, VAT, Expenses)
- Implement tab switching
- Persist selected tab in URL

### Step 3.2: Add Shared UI Components
**Goal**: Consistent UI across all sections
**Method**:
- DateRangePicker component
- FilterBar component
- SummaryCard component
- DataTable with sorting

---

## PHASE 4: Features & Enhancements

### Step 4.1: CSV Export for Sales
**Goal**: Generate downloadable CSV
**Method**:
- Include: order ID, date, items, subtotal, VAT, total, payment method
- Filter by date range
- Filter by payment status

### Step 4.2: VAT Remittance Report
**Goal**: Generate formatted VAT report
**Method**:
- Use existing `generateVatRemittanceReport` function
- Display in printable format
- Include supplier invoices for input VAT

### Step 4.3: Quick Actions
**Goal**: Common tasks at fingertips
**Method**:
- Quick export buttons
- Quick date presets (Today, This Week, This Month, Custom)
- Print report button

---

## PHASE 5: Testing & Refinement

### Step 5.1: Test Sales Reports
**Goal**: Verify sales filtering works
**Method**:
- Test date range filtering
- Test payment status filtering
- Verify CSV export contains correct data

### Step 5.2: Test Accounting Calculations
**Goal**: Verify profit calculations
**Method**:
- Compare with manual calculations
- Test edge cases (no expenses, no sales)

### Step 5.3: Test VAT Reports
**Goal**: Verify VAT compliance
**Method**:
- Test remittance generation
- Verify iTax export format

---

# 5. TESTING AND VALIDATION

### Success Criteria

**Sales Reports:**
- [ ] Filter sales by date range
- [ ] Filter sales by payment status (paid/pending/all)
- [ ] Display total sales, VAT, order count
- [ ] Export to CSV works correctly

**Accounting:**
- [ ] Display income (sales) for period
- [ ] Display expenses for period
- [ ] Calculate net profit correctly
- [ ] Category breakdown accurate

**VAT Compliance:**
- [ ] Output VAT calculated correctly
- [ ] Input VAT from expenses included
- [ ] Net VAT payable displayed
- [ ] Remittance report generates correctly
- [ ] iTax export format valid

**Expenses:**
- [ ] Add new expense with VAT
- [ ] Edit existing expense
- [ ] Filter by category
- [ ] Mark as paid/pending

**UI/UX:**
- [ ] Tab navigation works
- [ ] Date picker functions
- [ ] Responsive on tablet/desktop
- [ ] Loading states shown
