import os
import secrets
from datetime import timedelta

def get_or_generate_secret_key():
    key_file = 'instance/secret_key'
    if os.path.exists(key_file):
        with open(key_file, 'r') as f:
            return f.read().strip()
    
    # If key doesn't exist, generate a new one and save it
    os.makedirs('instance', exist_ok=True)
    secret_key = secrets.token_hex(32)
    with open(key_file, 'w') as f:
        f.write(secret_key)
    return secret_key

class Config:
    # Set a fixed secret key for development
    SECRET_KEY = get_or_generate_secret_key()
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///todo.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session configuration
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'  # Changed back to 'Lax' for HTTP development
    SESSION_COOKIE_NAME = 'session'
    SESSION_COOKIE_DOMAIN = None  # Remove domain restriction for localhost
    SESSION_COOKIE_PATH = '/'
    
    # Make sessions permanent by default
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_PERMANENT = True
    
    # CORS settings
    CORS_HEADERS = ['Content-Type', 'Authorization', 'Accept']