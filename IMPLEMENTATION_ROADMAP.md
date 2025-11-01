# 🚀 CRM IMPLEMENTATION ROADMAP
## Complete Unified Quotation System (Manual + AI)

---

## ✅ COMPLETED: Data Migration
- ✅ 1,341 hotels + 1,507 pricing records (TQA)
- ✅ 79 tours + 126 pricing records (TQA)
- ✅ 48 vehicles + 113 transfers (city & airport)
- ✅ 68 customer itineraries (TQA)
- ✅ 116 cities + 9 airports
- ✅ Manual quotes structure (Ruzgargucu)

---

## 📍 PHASE 1: Foundation & Catalog APIs ✅ IN PROGRESS

### What We're Building
Backend APIs to query all catalog data for building quotes

### Files Created
✅ `apps/api/src/services/catalog.service.ts` - Core catalog query logic
✅ `apps/api/src/routes/catalog.routes.ts` - REST API endpoints

### Deliverables
- [ ] Connect routes to Express app
- [ ] Test catalog APIs
  - GET /api/catalog/cities
  - GET /api/catalog/hotels?cityId=1&startDate=...&endDate=...
  - GET /api/catalog/tours?cityId=1&tourType=SIC
  - GET /api/catalog/transfers?fromCityId=1&toCityId=2

### Time Estimate: 2-3 days

---

## 📍 PHASE 2: Manual Quotation System (Backend)

### What We're Building
Complete CRUD APIs for agents to build manual quotes

### Files to Create
```
apps/api/src/
├── services/
│   └── manual-quote.service.ts       # Business logic
└── routes/
    └── manual-quotes.routes.ts       # REST endpoints
```

### API Endpoints
```
POST   /api/manual-quotes              # Create new quote
GET    /api/manual-quotes              # List all quotes
GET    /api/manual-quotes/:id          # Get quote details
PUT    /api/manual-quotes/:id          # Update quote
DELETE /api/manual-quotes/:id          # Delete quote

POST   /api/manual-quotes/:id/days         # Add day
PUT    /api/manual-quotes/:id/days/:dayId  # Update day
DELETE /api/manual-quotes/:id/days/:dayId  # Delete day

POST   /api/manual-quotes/:id/expenses         # Add expense
PUT    /api/manual-quotes/:id/expenses/:expId  # Update expense
DELETE /api/manual-quotes/:id/expenses/:expId  # Delete expense

POST   /api/manual-quotes/:id/calculate    # Recalculate pricing
GET    /api/manual-quotes/:id/pdf         # Generate PDF
```

### Deliverables
- [ ] ManualQuoteService with full CRUD
- [ ] Pricing calculation engine
- [ ] API routes connected
- [ ] Basic PDF generation

### Time Estimate: 5-7 days

---

## 📍 PHASE 3: AI Itinerary Generator (Backend)

### What We're Building
AI service that generates itineraries from customer preferences using catalog

### Files to Create
```
apps/api/src/
├── services/
│   ├── ai-itinerary-generator.service.ts  # Core AI logic
│   └── pricing-calculator.service.ts      # Price calculation
└── routes/
    └── ai-itineraries.routes.ts           # REST endpoints
```

### API Endpoints
```
POST   /api/ai-itineraries/generate       # Generate from preferences
GET    /api/ai-itineraries                # List all (agent)
GET    /api/ai-itineraries/:uuid          # Get by UUID (public)
PUT    /api/ai-itineraries/:uuid/status   # Update status
POST   /api/ai-itineraries/:uuid/convert-to-quote  # Convert to manual
```

### Core Logic Flow
```typescript
1. Parse customer input (destinations, dates, pax, preferences)
2. For each city/night:
   - Query catalog for hotels (matching category)
   - Query catalog for tours (1 per day)
   - Query catalog for transfers (between cities)
3. Calculate pricing per day
4. Generate itineraryData JSON
5. Store as CustomerItinerary
6. Return UUID for customer access
```

### Deliverables
- [ ] AI generator service
- [ ] Pricing calculator
- [ ] API routes
- [ ] Conversion logic (AI → Manual Quote)

### Time Estimate: 5-7 days

---

## 📍 PHASE 4: Manual Quote Builder UI (Frontend)

### What We're Building
CRM dashboard section for agents to create/edit manual quotes

### Files to Create
```
apps/web/src/
├── pages/
│   └── quotes/
│       ├── index.tsx                    # List view
│       ├── [id].tsx                     # Detail/Edit view
│       └── new.tsx                      # Create new
├── components/
│   └── quotes/
│       ├── QuoteForm.tsx                # Main form
│       ├── QuoteDayBuilder.tsx          # Day-by-day builder
│       ├── ExpenseForm.tsx              # Add expenses
│       ├── CatalogSearch.tsx            # Search hotels/tours
│       └── PricingSummary.tsx           # Real-time totals
└── lib/
    └── api/
        └── quotes.ts                    # API client functions
```

### Features
- ✅ List all quotes (table with search/filter)
- ✅ Create new quote wizard
  - Basic info (name, dates, pax, category)
  - Add days sequentially
  - For each day: add expenses
    - Hotel (search catalog or manual entry)
    - Tours (search catalog)
    - Transfers, meals, fees
  - Real-time pricing calculation
- ✅ Edit existing quote
- ✅ Duplicate quote
- ✅ Generate PDF
- ✅ Delete quote

### Deliverables
- [ ] Quote list page with data table
- [ ] Quote builder form (multi-step)
- [ ] Catalog search components
- [ ] Pricing calculator UI
- [ ] PDF preview/download

### Time Estimate: 10-12 days

---

## 📍 PHASE 5: AI Itinerary Public Form (Frontend)

### What We're Building
Customer-facing form widget for website (can embed or standalone page)

### Files to Create
```
apps/web/src/
├── pages/
│   └── itinerary/
│       ├── form.tsx                     # Public form
│       └── [uuid].tsx                   # View generated itinerary
└── components/
    └── itinerary/
        ├── ItineraryForm.tsx            # Multi-step form
        ├── DestinationSelector.tsx      # City + nights input
        ├── PreferencesForm.tsx          # Hotel, tour type, etc.
        ├── ItineraryPreview.tsx         # Generated result display
        └── BookingRequest.tsx           # Request booking button
```

### Form Flow
```
Step 1: Where & When
├─ Select destinations (Istanbul, Cappadocia, etc.)
├─ Nights per city
└─ Start date (auto-calculate end date)

Step 2: Who
├─ Adults count
├─ Children count
└─ Hotel category (3, 4, 5 stars)

Step 3: Preferences
├─ Tour type (SIC or Private)
└─ Special requests (textarea)

Step 4: Generate
├─ Show loading animation
└─ Display generated itinerary
    ├─ Day-by-day breakdown
    ├─ Hotel, tours, transfers per day
    ├─ Pricing breakdown
    └─ Total price

Step 5: Request Booking
└─ Customer fills contact info → Email to agent
```

### Deliverables
- [ ] Multi-step form component
- [ ] Loading state with progress indicator
- [ ] Generated itinerary display (beautiful UI)
- [ ] Booking request flow
- [ ] Embeddable widget version

### Time Estimate: 8-10 days

---

## 📍 PHASE 6: Agent Dashboard for AI Itineraries

### What We're Building
CRM section for agents to view/manage AI-generated customer requests

### Files to Create
```
apps/web/src/
├── pages/
│   └── itineraries/
│       ├── index.tsx                    # List view
│       └── [uuid].tsx                   # Detail view
└── components/
    └── itineraries/
        ├── ItineraryList.tsx            # Table view
        ├── ItineraryDetail.tsx          # Full itinerary display
        ├── StatusUpdater.tsx            # Approve/Reject actions
        └── ConvertToQuote.tsx           # Convert to manual quote
```

### Features
- ✅ List all customer itineraries
  - Filter by status (Pending, Confirmed, Booked)
  - Search by customer name/email
- ✅ View itinerary details
  - Customer info
  - Full day-by-day plan
  - Pricing breakdown
- ✅ Actions
  - Approve/Reject
  - Convert to Manual Quote (for customization)
  - Mark as booked
  - Send modified version to customer

### Deliverables
- [ ] Itinerary list page
- [ ] Detail view with actions
- [ ] Status management
- [ ] Convert to Manual Quote button

### Time Estimate: 5-6 days

---

## 📍 PHASE 7: Integration & Polish

### What We're Building
Connect everything, add auth, notifications, PDF generation

### Tasks
- [ ] **Authentication**
  - Public routes: AI form, view itinerary
  - Protected routes: All agent dashboard

- [ ] **Email Notifications**
  - Customer submits itinerary → Email to agent
  - Agent updates status → Email to customer

- [ ] **PDF Generation**
  - Manual Quote PDF (professional layout)
  - AI Itinerary PDF (customer-friendly)

- [ ] **Dashboard Home**
  - Stats cards (quotes this month, pending itineraries)
  - Recent activity feed
  - Quick actions

- [ ] **Settings**
  - Markup % configuration
  - Tax % configuration
  - Email templates
  - Company branding for PDFs

### Time Estimate: 7-10 days

---

## 📊 TOTAL TIMELINE

| Phase | Days | Cumulative |
|-------|------|------------|
| Phase 1: Catalog APIs | 2-3 | Week 1 |
| Phase 2: Manual Quote Backend | 5-7 | Week 2 |
| Phase 3: AI Backend | 5-7 | Week 3 |
| Phase 4: Manual Quote UI | 10-12 | Weeks 4-5 |
| Phase 5: AI Form UI | 8-10 | Weeks 6-7 |
| Phase 6: Agent Dashboard | 5-6 | Week 8 |
| Phase 7: Integration | 7-10 | Weeks 9-10 |

**Total: 8-10 weeks** for complete system

---

## 🎯 MILESTONES

### Milestone 1 (End of Week 3)
✅ Backend complete - Can create quotes & generate itineraries via API

### Milestone 2 (End of Week 5)
✅ Agents can create manual quotes in CRM dashboard

### Milestone 3 (End of Week 7)
✅ Customers can generate AI itineraries on website

### Milestone 4 (End of Week 10)
✅ Complete unified system with all features

---

## 📝 NEXT IMMEDIATE STEPS

1. **Register Catalog Routes** (10 minutes)
   - Add to apps/api/src/index.ts or main router

2. **Test Catalog APIs** (30 minutes)
   - Use Postman/Thunder Client
   - Verify data returns correctly

3. **Start Phase 2** (Manual Quote Backend)
   - Create ManualQuoteService
   - Build CRUD endpoints

---

## 🚦 DECISION POINTS

### Now: Which to build first?
**Option A**: Manual Quotes → AI Itineraries (agent tool first)
**Option B**: AI Itineraries → Manual Quotes (customer-facing first)

**Recommendation**: Option A
- Agents need the tool to do their job
- Can test manually before exposing to customers
- Easier to debug with internal users

### Do you want me to:
1. ✅ Continue with Phase 2 (Manual Quote Backend)?
2. ✅ Jump to Phase 3 (AI Backend)?
3. ✅ Start building UI first to see the vision?

---

**Let me know which direction you'd like to go, and I'll build it step by step!**
