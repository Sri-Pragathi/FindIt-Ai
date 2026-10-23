# FindItAi — Python Flask & SQLAlchemy REST Backend

This directory contains the standalone Python + Flask REST API and PostgreSQL / SQLite database models for FindItAi.

## Requirements
- Python 3.10+
- PostgreSQL or SQLite
- (Optional) `GEMINI_API_KEY` for AI-assisted semantic matching

## Setup Instructions

1. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file or export variables:
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/finditai"
   export SECRET_KEY="your-campus-secret-key"
   export GEMINI_API_KEY="your-gemini-api-key"
   ```
   *(Defaults to local SQLite `finditai.db` if `DATABASE_URL` is omitted)*

4. **Run the Flask Development Server**:
   ```bash
   python app.py
   ```
   The API will listen at `http://localhost:5000/api`.
