# CloudPlay

CloudPlay is a cloud gaming platform prototype.

## Architecture

```text
React
  |
  v
Amazon Cognito
  |
  | Access Token
  v
FastAPI
  |
  v
DynamoDB
  |
  | user_id -> instance_id
  v
EC2
```

## Main features

- User signup/login with Cognito
- User-specific username
- Cognito JWT protection
- User -> EC2 mapping through DynamoDB
- Start/stop cloud PC
- CloudPlay game catalog
- React dashboard
- FastAPI backend

## Local development

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Important

Do not commit:

- `.env`
- `venv`
- `node_modules`
- `dist`
- AWS secret keys
- passwords

## Cloud gaming

Actual game streaming is a later phase. A small EC2 instance is useful for testing the CloudPlay API and EC2 lifecycle, but modern games require appropriate Windows GPU infrastructure and a streaming solution.