# CloudPlay Deployment Steps

## Phase 1 - Local frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

## Phase 2 - Local backend

Open another terminal:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

## Phase 3 - Cognito

Create/configure a Cognito User Pool.

Required application values:

- User Pool ID
- App Client ID
- Region

The frontend `.env` must contain:

```env
VITE_COGNITO_USER_POOL_ID=...
VITE_COGNITO_CLIENT_ID=...
VITE_AWS_REGION=ap-south-1
```

The backend `.env` must contain:

```env
COGNITO_USER_POOL_ID=...
COGNITO_APP_CLIENT_ID=...
AWS_REGION=ap-south-1
```

For the direct Cognito SDK login used in this starter, the app client must allow the authentication flow supported by `amazon-cognito-identity-js` (SRP).

## Phase 4 - DynamoDB

Create table:

```text
CloudPlayUsers
```

Partition key:

```text
user_id
```

Type:

```text
String
```

Use on-demand billing for development.

## Phase 5 - IAM

The AWS identity used by FastAPI needs permission for:

```text
dynamodb:GetItem
dynamodb:PutItem
ec2:DescribeInstances
ec2:StartInstances
ec2:StopInstances
```

For production, restrict resources and permissions further.

## Phase 6 - Create/test an EC2 instance

Start with a low-cost instance for API/infrastructure testing.

Do not expect a small non-GPU instance to provide playable modern cloud gaming.

For actual Windows gaming, use a suitable Windows GPU-capable EC2 instance later.

## Phase 7 - Map Cognito user to EC2

Get the user's Cognito `sub`.

Then run:

```powershell
cd backend

python scripts/map_user_instance.py `
  --user-sub "COGNITO_SUB" `
  --instance-id "i-xxxxxxxxxxxxxxxxx" `
  --instance-type "t3.medium"
```

## Phase 8 - Test

Without a token:

```text
GET /api/cloud-pc/status
```

Expected:

```text
401 Unauthorized
```

After login, the frontend sends:

```text
Authorization: Bearer <Cognito access token>
```

The backend:

```text
Cognito token
 -> verified sub
 -> DynamoDB
 -> EC2 instance ID
 -> EC2 API
```

## Phase 9 - Production architecture

Frontend:

```text
React
 -> npm run build
 -> S3
 -> CloudFront
```

Backend:

```text
FastAPI
 -> Docker
 -> ECR
 -> ECS/Fargate
 -> ALB
```

Future gaming layer:

```text
Windows EC2 GPU
 -> Sunshine / browser streaming
 -> user device
```

Never put `.env`, AWS secret keys, passwords, `node_modules`, Python `venv`, or build artifacts in the Git repository or project ZIP.