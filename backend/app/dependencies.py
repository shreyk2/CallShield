from fastapi import Header, HTTPException
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

async def verify_token(authorization: str = Header(...)):
    if not SUPABASE_JWT_SECRET or SUPABASE_JWT_SECRET == "your_jwt_secret_here":
        # Fallback for development if secret is not set
        # For now, we might want to allow it to pass or fail. 
        # Let's fail to prompt the user to fix it.
        print("WARNING: SUPABASE_JWT_SECRET is not set.")
        
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authentication header format")
            
        token = authorization.split(" ")[1]
        
        # If secret is missing, we can't verify signature securely.
        # For strict security, we should fail.
        if not SUPABASE_JWT_SECRET:
             raise HTTPException(status_code=500, detail="Server misconfiguration: Missing JWT Secret")

        # Verify the token
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return payload['sub'] # Returns the User ID (UUID)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
