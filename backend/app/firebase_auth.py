"""Firebase Authentication Integration"""
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Optional
import logging
import os
import json

from .database import get_db
from . import models

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK with service account.
    
    Supports two methods (in priority order):
    1. Environment variable: FIREBASE_SERVICE_ACCOUNT (JSON string)
    2. File-based: serviceAccountKey.json (checks multiple paths)
    """
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            cred = None
            
            # Method 1: Try environment variable first (most reliable for production)
            firebase_creds_json = os.getenv('FIREBASE_SERVICE_ACCOUNT')
            if firebase_creds_json:
                try:
                    logger.info("Attempting to initialize Firebase from environment variable")
                    creds_dict = json.loads(firebase_creds_json)
                    cred = credentials.Certificate(creds_dict)
                    logger.info("✓ Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT")
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON in FIREBASE_SERVICE_ACCOUNT: {e}")
                except Exception as e:
                    logger.error(f"Failed to load Firebase from env var: {e}")
            
            # Method 2: Try file-based credentials (for local dev and volume mounts)
            if not cred:
                possible_paths = [
                    Path(__file__).parent.parent / "serviceAccountKey.json",  # /app/serviceAccountKey.json
                    Path("/app/serviceAccountKey.json"),  # Absolute path (Docker volume mount)
                    Path.cwd() / "serviceAccountKey.json",  # Current working directory
                ]
                
                service_account_path = None
                for path in possible_paths:
                    logger.info(f"Checking for Firebase credentials at: {path}")
                    if path.exists():
                        service_account_path = path
                        logger.info(f"✓ Found Firebase credentials at: {path}")
                        break
                    else:
                        logger.debug(f"✗ Not found at: {path}")
                
                if service_account_path:
                    try:
                        cred = credentials.Certificate(str(service_account_path))
                        logger.info(f"✓ Firebase credentials loaded from file: {service_account_path}")
                    except Exception as e:
                        logger.error(f"Failed to load credentials from {service_account_path}: {e}")
            
            # If still no credentials found, log detailed error
            if not cred:
                logger.error("=" * 60)
                logger.error("Firebase service account key not found!")
                logger.error("=" * 60)
                logger.error(f"Current working directory: {os.getcwd()}")
                logger.error(f"__file__ location: {__file__}")
                logger.error(f"Parent directory: {Path(__file__).parent.parent}")
                try:
                    logger.error(f"Directory contents: {list(Path(__file__).parent.parent.iterdir())}")
                except Exception:
                    pass
                logger.error("Environment variables: FIREBASE_SERVICE_ACCOUNT = " + 
                           ("SET" if os.getenv('FIREBASE_SERVICE_ACCOUNT') else "NOT SET"))
                logger.error("=" * 60)
                logger.error("To fix this issue:")
                logger.error("1. Set FIREBASE_SERVICE_ACCOUNT environment variable, OR")
                logger.error("2. Mount serviceAccountKey.json to /app/serviceAccountKey.json")
                logger.error("=" * 60)
                return False
            
            # Initialize Firebase with the credentials
            firebase_admin.initialize_app(cred)
            logger.info("✓✓✓ Firebase Admin SDK initialized successfully ✓✓✓")
            return True
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}", exc_info=True)
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
