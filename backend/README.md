# CloudPlay Backend

## Local setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` with your Cognito values.

Start:

```powershell
uvicorn app.main:app --reload
```

Health:

```text
http://127.0.0.1:8000/health
```

Run tests:

```powershell
pytest
```

## AWS credentials

For local development, configure AWS credentials using your normal AWS CLI/profile setup. Do not put AWS access keys in `.env` or source code.