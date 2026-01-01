# Settlemint 💸

**Settlemint** is a modern, auto-reconciled expense sharing system with blockchain-backed settlement proofs. Think "Splitwise on Steroids" — built for transparency and trust.

## 🚀 Features

*   **👥 Group Management**: Create groups and invite friends via email instantly.
*   **💰 Smart Reconciliation**: Automatically calculates "Who owes who" to minimize transactions.
*   **🔐 Secure Authentication**: Seamless login with Google via Supabase Auth.
*   **📜 Trustless Settlements**: (Coming Soon) Every confirmed payment is cryptographically hashed and stored on the Ethereum blockchain.
*   **⚡ Real-time Dashboard**: Interactive UI to track expenses and balances.
*   **🔄 Async Architecture**: Heavy lifting is handled by background workers (Celery + Redis).

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 14 (React)
*   **Styling**: Tailwind CSS + Lucide Icons
*   **State/Auth**: Supabase Client

### Backend
*   **Framework**: FastAPI (Python 3.10+)
*   **Database**: PostgreSQL (Supabase)
*   **Queue**: Redis (Upstash) + Celery
*   **ORM**: SQLAlchemy + Alembic

## ⚡ Quick Start

### 1. Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL (or Supabase account)
*   Redis (or Upstash account)

### 2. Backend Setup

```bash
# Clone the repo
git clone https://github.com/arya232006/Settlemint.git
cd Settlemint

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Run Migrations
cd backend
alembic upgrade head
```

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install
```

### 4. Configuration

Create a `.env` file in `backend/` and `.env.local` in `frontend/` with your Supabase and Database credentials.

**Backend (`backend/.env`)**:
```env
SQLALCHEMY_DATABASE_URI=postgresql://user:pass@host:5432/db
REDIS_URL=rediss://default:pass@host:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

**Frontend (`frontend/.env.local`)**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 5. Run the App

**Terminal 1: Backend API**
```bash
# From root
cd backend
uvicorn app.main:app --reload
```

**Terminal 2: Frontend**
```bash
# From root
cd frontend
npm run dev
```

**Terminal 3: Background Worker (Optional)**
```bash
# From root
cd backend
celery -A app.celery_app worker --loglevel=info --pool=solo
```

## 📚 API Documentation

Once the backend is running, visit: `http://localhost:8000/docs`

## 🧪 Testing

```bash
pytest backend/tests
```
