# Settlemint 💸

**Settlemint** is an auto-reconciled expense sharing system with blockchain-backed settlement proofs. Think "Splitwise on Steroids".

## 🚀 Features

*   **Smart Reconciliation**: Uses graph algorithms to minimize the number of transactions.
*   **Trustless Settlements**: Every confirmed payment is cryptographically hashed and stored on the Ethereum blockchain.
*   **In-App Payments**: Supports both manual (Cash/Venmo) and automated (Stripe/Crypto) payments.
*   **Async Architecture**: Heavy lifting (Blockchain/Email) is handled by background workers (Celery + Redis).

## 🛠️ Tech Stack

*   **Backend**: FastAPI (Python 3.10+)
*   **Database**: PostgreSQL (Supabase)
*   **Queue**: Redis (Upstash) + Celery
*   **Blockchain**: Solidity (Ethereum/Sepolia)
*   **ORM**: SQLAlchemy

## ⚡ Quick Start

### 1. Prerequisites
*   Python 3.10+
*   PostgreSQL (or Supabase account)
*   Redis (or Upstash account)

### 2. Installation

```bash
# Clone the repo
git clone https://github.com/arya232006/Settlemint.git
cd Settlemint

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

### 4. Run the App

**Terminal 1: API Server**
```bash
uvicorn app.main:app --reload --app-dir backend
```

**Terminal 2: Background Worker**
```bash
cd backend
celery -A app.celery_app worker --loglevel=info --pool=solo
```

## 📚 API Documentation

Once running, visit: `http://localhost:8000/docs`

## 🧪 Testing

```bash
pytest backend/tests
```
