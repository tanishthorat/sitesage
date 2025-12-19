"""Firebase Authentication Integration"""
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Optional
import logging

from .database import get_db
from . import models

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account"""
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            service_account_path = Path(__file__).parent.parent / "serviceAccountKey.json"
            
            if not service_account_path.exists():
                logger.warning("Firebase service account key not found. Authentication will be disabled.")
                return False
            
            cred = credentials.Certificate(str(service_account_path))
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")
            return True
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return False

# Initialize on module load
firebase_initialized = initialize_firebase()

# Security schemes for Bearer token
security = HTTPBearer()  # For required authentication (raises 401 if missing)
optional_security = HTTPBearer(auto_error=False)  # For optional authentication (returns None if missing)

def get_current_user(
    token: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Verify Firebase ID token and return the corresponding user.
    Creates a new user if this is their first login (auto-registration).
    
    Args:
        token: JWT token from Firebase Authentication
        db: Database session
        
    Returns:
        User model instance
        
    Raises:
        HTTPException: If token is invalid or authentication fails
    """
    if not firebase_initialized:
        raise HTTPException(
            status_code=503,
            detail="Authentication service unavailable"
        )
    
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token.credentials)
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email')
        
        if not email:
            raise HTTPException(
                status_code=400,
                detail="Email not found in Firebase token"
            )
        
        logger.info(f"Authenticated user: {email} (UID: {firebase_uid})")
        
        # Find existing user in database
        user = db.query(models.User).filter(
            models.User.firebase_uid == firebase_uid
        ).first()
        
        # Auto-register new user (upsert logic)
        if not user:
            logger.info(f"Creating new user: {email}")
            user = models.User(
                email=email,
                firebase_uid=firebase_uid,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"New user created with ID: {user.id}")
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=403,
                detail="User account is deactivated"
            )
        
        return user
        
    except auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase ID token")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )
    except auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase ID token")
        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired"
        )
    except auth.RevokedIdTokenError:
        logger.warning("Revoked Firebase ID token")
        raise HTTPException(
            status_code=401,
            detail="Authentication token has been revoked"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(optional_security),
    db: Session = Depends(get_db)
) -> Optional[models.User]:
    """
    Optional authentication dependency - returns User if valid token provided, None otherwise.
    
    This allows endpoints to work for both authenticated users and guests.
    - If Authorization header is present and valid: Returns User object
    - If Authorization header is missing or invalid: Returns None (Guest mode)
    
    Args:
        credentials: Optional Bearer token from Authorization header (auto_error=False)
        db: Database session
        
    Returns:
        User object if authenticated, None if guest
    """
    # No token provided - Guest mode
    if not credentials:
        logger.info("Guest user (no authentication token provided)")
        return None
    
    # Firebase not initialized - Guest mode
    if not firebase_initialized:
        logger.warning("Firebase not initialized, treating as guest")
        return None
    
    # Token provided - attempt to verify
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email')
        
        if not email:
            logger.warning("Email not found in token, treating as guest")
            return None
        
        logger.info(f"Authenticated user: {email} (UID: {firebase_uid})")
        
        # Find or create user
        user = db.query(models.User).filter(
            models.User.firebase_uid == firebase_uid
        ).first()
        
        if not user:
            logger.info(f"Auto-registering new user: {email}")
            user = models.User(
                email=email,
                firebase_uid=firebase_uid,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Check if user is active
        if not user.is_active:
            logger.warning(f"Inactive user attempted access: {email}")
            return None
        
        return user
        
    except Exception as e:
        # Any authentication error - treat as guest
        logger.warning(f"Authentication failed, treating as guest: {e}")
        return None
