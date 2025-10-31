# Tour Operator CRM - Entity Relationship Diagram

## Mermaid ERD

```mermaid
erDiagram
    tenants ||--o{ users : has
    tenants ||--o{ clients : has
    tenants ||--o{ leads : has
    tenants ||--o{ tours : has
    tenants ||--o{ vendors : has
    tenants ||--o{ quotations : has
    tenants ||--o{ bookings : has
    tenants ||--o{ invoices : has
    tenants ||--o{ exchange_rates : has
    tenants ||--o{ audit_logs : has

    users {
        int id PK
        int tenant_id FK
        string name
        string email
        string password_hash
        enum role
        datetime created_at
        datetime updated_at
    }

    clients {
        int id PK
        int tenant_id FK
        string name
        string email
        string phone
        string nationality
        string preferred_language
        text notes
        datetime created_at
        datetime updated_at
    }

    leads {
        int id PK
        int tenant_id FK
        int client_id FK
        string source
        datetime inquiry_date
        string destination
        int pax_adults
        int pax_children
        decimal budget_eur
        enum status
        text notes
        datetime created_at
        datetime updated_at
    }

    tours {
        int id PK
        int tenant_id FK
        string code
        string name
        text description
        int base_capacity
        date season_start
        date season_end
        decimal default_markup_pct
        datetime created_at
        datetime updated_at
    }

    itineraries {
        int id PK
        int tenant_id FK
        int tour_id FK
        int day_number
        string title
        text description
        string transport
        string accommodation
        string meals
        datetime created_at
        datetime updated_at
    }

    vendors {
        int id PK
        int tenant_id FK
        string name
        enum type
        string contact_name
        string phone
        string email
        string tax_id
        text address
        datetime created_at
        datetime updated_at
    }

    vendor_rates {
        int id PK
        int tenant_id FK
        int vendor_id FK
        date season_from
        date season_to
        string service_type
        decimal cost_try
        text notes
        datetime created_at
        datetime updated_at
    }

    quotations {
        int id PK
        int tenant_id FK
        int lead_id FK
        int tour_id FK
        json custom_json
        decimal calc_cost_try
        decimal sell_price_eur
        decimal exchange_rate_used
        datetime valid_until
        enum status
        datetime created_at
        datetime updated_at
    }

    bookings {
        int id PK
        int tenant_id FK
        int quotation_id FK
        int client_id FK
        date start_date
        date end_date
        decimal locked_exchange_rate
        decimal total_cost_try
        decimal total_sell_eur
        decimal deposit_due_eur
        decimal balance_due_eur
        enum status
        datetime created_at
        datetime updated_at
    }

    booking_items {
        int id PK
        int tenant_id FK
        int booking_id FK
        enum item_type
        int vendor_id FK
        int qty
        decimal unit_cost_try
        decimal unit_price_eur
        text notes
        datetime created_at
        datetime updated_at
    }

    payments_client {
        int id PK
        int tenant_id FK
        int booking_id FK
        decimal amount_eur
        string method
        datetime paid_at
        string txn_ref
        enum status
        datetime created_at
        datetime updated_at
    }

    payments_vendor {
        int id PK
        int tenant_id FK
        int booking_id FK
        int vendor_id FK
        decimal amount_try
        datetime due_at
        datetime paid_at
        enum status
        datetime created_at
        datetime updated_at
    }

    exchange_rates {
        int id PK
        int tenant_id FK
        string from_currency
        string to_currency
        decimal rate
        date rate_date
        string source
        datetime created_at
        datetime updated_at
    }

    invoices {
        int id PK
        int tenant_id FK
        int booking_id FK
        string number
        date issue_date
        string currency
        decimal net_amount
        decimal vat_amount
        decimal gross_amount
        string pdf_url
        datetime created_at
        datetime updated_at
    }

    audit_logs {
        int id PK
        int tenant_id FK
        int user_id FK
        string entity
        int entity_id
        string action
        json diff_json
        datetime created_at
    }

    clients ||--o{ leads : creates
    leads ||--o{ quotations : generates
    tours ||--o{ itineraries : contains
    tours ||--o{ quotations : references
    quotations ||--o{ bookings : converts_to
    bookings ||--o{ booking_items : contains
    bookings ||--o{ payments_client : receives
    bookings ||--o{ payments_vendor : makes
    bookings ||--o{ invoices : generates
    vendors ||--o{ vendor_rates : has
    vendors ||--o{ booking_items : provides
    vendors ||--o{ payments_vendor : receives
```

## Key Relationships

### Multi-Tenancy
- Every business entity has `tenant_id` for complete data isolation
- Queries are automatically scoped by tenant

### Business Flow
1. **Lead Generation**: Client creates lead with inquiry
2. **Quotation**: Lead generates quotation using tour templates or custom itinerary
3. **Booking**: Accepted quotation converts to booking with locked exchange rate
4. **Items**: Booking contains items (hotels, transport, guides, activities)
5. **Payments**: Track client payments (EUR) and vendor payments (TRY)
6. **Invoice**: Generate invoice with VAT calculation

### Currency Management
- Vendor costs stored in TRY (`cost_try`)
- Client prices stored in EUR (`sell_price_eur`, `amount_eur`)
- Exchange rates tracked daily
- **Critical**: `locked_exchange_rate` frozen at booking confirmation for accounting accuracy

### Audit Trail
- All sensitive changes logged to `audit_logs`
- Tracks user, entity, action, and JSON diff

## Indexes

Key indexes for performance:
- `tenant_id` on all tables (most selective filter)
- `email` + `tenant_id` (unique constraint for users/clients)
- `status` fields for filtering
- `rate_date` on exchange_rates
- Foreign keys for joins

## Enum Values

### UserRole
- `OWNER`, `ADMIN`, `AGENT`, `OPERATIONS`, `ACCOUNTING`, `GUIDE`, `VENDOR`

### LeadStatus
- `NEW`, `CONTACTED`, `QUOTED`, `WON`, `LOST`

### QuotationStatus
- `DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`

### BookingStatus
- `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

### VendorType
- `HOTEL`, `TRANSPORT`, `GUIDE`, `ACTIVITY`

### ItemType
- `HOTEL`, `TRANSFER`, `GUIDE`, `ACTIVITY`, `FEE`, `DISCOUNT`

### PaymentStatus
- `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
