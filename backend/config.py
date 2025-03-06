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
    # Set a secure secret key
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///todo.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session configuration
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # CORS settings
    CORS_HEADERS = 'Content-Type'