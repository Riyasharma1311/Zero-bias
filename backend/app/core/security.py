from datetime import datetime, timedelta
from typing import Any, Union, Optional, Dict
from jose import jwt
from passlib.context import CryptContext
from app.core.config import get_settings
import secrets
import time
import json
import os

settings = get_settings()

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token configuration
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Key rotation settings
KEY_ROTATION_INTERVAL = settings.KEY_ROTATION_INTERVAL
KEYS_FILE_PATH = "jwt_keys.json"

def load_jwt_keys() -> Dict[str, Dict[str, Any]]:
    """Load JWT keys from file if it exists, otherwise return empty dict."""
    if os.path.exists(KEYS_FILE_PATH):
        with open(KEYS_FILE_PATH, 'r') as f:
            return json.load(f)
    return {}

def save_jwt_keys(keys: Dict[str, Dict[str, Any]]) -> None:
    """Save JWT keys to file."""
    with open(KEYS_FILE_PATH, 'w') as f:
        json.dump(keys, f, indent=2)

# Initialize keys from file
_jwt_keys = load_jwt_keys()

def rotate_jwt_keys() -> None:
    """
    Rotate JWT keys by generating a new key and removing expired ones.
    Keys are kept for twice the token expiration time to allow validation
    of recently issued tokens.
    """
    current_time = time.time()
    new_key_id = secrets.token_hex(8)
    
    # Add new key
    _jwt_keys[new_key_id] = {
        "key": secrets.token_urlsafe(32),
        "created_at": current_time
    }
    
    # Remove expired keys
    expiration_threshold = current_time - (2 * ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    expired_keys = [
        kid for kid, data in _jwt_keys.items()
        if data["created_at"] < expiration_threshold
    ]
    for kid in expired_keys:
        del _jwt_keys[kid]
        
    # Save updated keys to file
    save_jwt_keys(_jwt_keys)

def get_current_jwt_key() -> tuple[str, str]:
    """
    Get the current JWT key for token signing.
    Rotates keys if necessary.
    
    Returns:
        Tuple of (key_id, key)
    """
    current_time = time.time()
    
    # Initialize first key if none exist
    if not _jwt_keys:
        rotate_jwt_keys()
    
    # Check if we need to rotate keys
    newest_key = max(_jwt_keys.items(), key=lambda x: x[1]["created_at"])
    if current_time - newest_key[1]["created_at"] > KEY_ROTATION_INTERVAL:
        rotate_jwt_keys()
        newest_key = max(_jwt_keys.items(), key=lambda x: x[1]["created_at"])
    
    return newest_key[0], newest_key[1]["key"]


def create_access_token(
    subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: The subject of the token (usually user ID)
        role: The user's role for authorization
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Get current key for signing
    key_id, current_key = get_current_jwt_key()
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "kid": key_id
    }
    
    encoded_jwt = jwt.encode(
        to_encode, current_key, algorithm=ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    
    Args:
        plain_password: The plaintext password
        hashed_password: The hashed password to compare against
        
    Returns:
        True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: The plaintext password to hash
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    
    Args:
        token: The JWT token to decode
        
    Returns:
        Decoded token payload
        
    Raises:
        JWTError: If token is invalid or expired
    """
    # First decode without verification to get key ID
    unverified_payload = jwt.get_unverified_claims(token)
    key_id = unverified_payload.get("kid")
    
    if not key_id or key_id not in _jwt_keys:
        raise jwt.JWTError("Invalid or expired token")
    
    # Verify and decode token with correct key
    return jwt.decode(
        token,
        _jwt_keys[key_id]["key"],
        algorithms=[ALGORITHM]
    )
