# Setup Instructions for Home Computer

This document contains all the steps needed to get the Tour Operator CRM project running on your home computer.

## Prerequisites to Install

### 1. **Node.js** (v18 or later)
   - Download from: https://nodejs.org/
   - Recommended: Use LTS version
   - Verify installation: `node --version` (should be v18+)

### 2. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### 3. **PostgreSQL** (v14 or later)
   - Download from: https://www.postgresql.org/download/
   - During installation, remember your postgres password
   - Default port: 5432

### 4. **Code Editor** (Optional but recommended)
   - Visual Studio Code: https://code.visualstudio.com/
   - Or any editor you prefer

## Project Setup Steps

### Step 1: Clone the Repository

```bash
cd ~/Desktop  # or wherever you want to work
git clone https://github.com/fatihtunali/crm.git
cd crm
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo (both API and Web app).

### Step 3: Set Up Database

1. **Create PostgreSQL Database:**
   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE tour_crm;

   # Exit psql
   \q
   ```

2. **Create Environment File:**

   Create a file named `.env` in the root of the project:

   ```env
   # Database
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tour_crm?schema=public"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"

   # API
   PORT=3001
   API_PREFIX="api/v1"

   # CORS
   CORS_ORIGIN="http://localhost:3000"

   # Frontend
   NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
   ```

   **Important:** Replace `YOUR_PASSWORD` with your PostgreSQL password!

### Step 4: Run Database Migrations

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

This will:
- Create all database tables
- Set up the schema
- Generate Prisma client

### Step 5: (Optional) Seed Database

If there's a seed script available:
```bash
npm run prisma:seed
```

### Step 6: Start Development Servers

Open **two terminal windows**:

**Terminal 1 - API Server:**
```bash
cd apps/api
npm run dev
```

The API will start on http://localhost:3001

**Terminal 2 - Web App:**
```bash
cd apps/web
npm run dev
```

The web app will start on http://localhost:3000

## Verify Installation

1. **Check API:**
   - Open http://localhost:3001/api/docs
   - You should see Swagger API documentation

2. **Check Web App:**
   - Open http://localhost:3000
   - You should see the login page

## Important Files & Locations

### Configuration Files:
- `.env` - Environment variables (create this yourself, see Step 3)
- `package.json` - Project dependencies
- `apps/api/prisma/schema.prisma` - Database schema

### Key Directories:
- `apps/api/src/` - Backend NestJS API source code
- `apps/web/` - Frontend Next.js application
- `apps/api/prisma/` - Database schema and migrations
- `shared/` - Shared TypeScript types between API and Web

## Recent Changes (What Was Just Pushed)

The latest commit includes:

1. **Complete Supplier Catalog System:**
   - Parties, Contacts, Suppliers
   - Service Offerings (Hotels, Transfers, Vehicles, Guides, Activities)
   - Full CRUD operations for all service types

2. **Pricing Engine:**
   - Universal pricing quote endpoint: `POST /api/v1/pricing/quote`
   - Automatic rate resolution based on service date
   - Support for all service types with season-based rates

3. **Activities Module:**
   - Complete implementation for tours, attractions, experiences
   - Tiered pricing and discount support

4. **Guides & Vehicles Modules:**
   - Full CRUD operations
   - Rate management with different pricing models

5. **Booking Integration:**
   - Booking items now support catalog-based auto-pricing
   - Pricing snapshot pattern for historical data

6. **Enhanced Swagger Documentation:**
   - Comprehensive API documentation at `/api/docs`
   - All supplier catalog endpoints documented

## Troubleshooting

### Database Connection Issues:
- Verify PostgreSQL is running: Check Services (Windows) or Activity Monitor (Mac)
- Check DATABASE_URL in .env matches your PostgreSQL credentials
- Ensure database exists: `psql -U postgres -l` to list databases

### Port Already in Use:
- API (3001): Kill process using `taskkill /F /PID <PID>` (Windows) or `kill <PID>` (Mac/Linux)
- Web (3000): Same as above
- Find PID: `netstat -ano | findstr :3001` (Windows) or `lsof -i :3001` (Mac/Linux)

### npm install Fails:
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules`
- Delete package-lock.json: `rm package-lock.json`
- Try again: `npm install`

### Prisma Issues:
- Regenerate client: `npx prisma generate`
- Reset database: `npx prisma migrate reset` (WARNING: deletes all data!)

## Next Steps

After setup, you can:

1. **Explore the API:**
   - Visit http://localhost:3001/api/docs
   - Test endpoints using the Swagger UI

2. **Create Test Data:**
   - Use the API to create suppliers, service offerings, rates
   - Test the pricing quote endpoint

3. **Develop Features:**
   - API code: `apps/api/src/`
   - Frontend code: `apps/web/`

## Support

If you encounter issues:
1. Check this setup guide again
2. Review error messages in terminal
3. Check `.env` file configuration
4. Verify all prerequisites are installed correctly

---

**Last Updated:** 2025-10-31
**Git Commit:** aa8fb94 (feat: complete supplier catalog with pricing engine and Swagger documentation)
