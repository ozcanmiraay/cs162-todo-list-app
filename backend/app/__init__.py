from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from datetime import timedelta

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    CORS(app,
         resources={
             r"/*": {
                 "origins": ["http://localhost:3000"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Accept"],
                 "supports_credentials": True,
                 "expose_headers": ["Set-Cookie"]
             }
         })

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    
    # Configure session handling with more permissive settings for development
    app.config.update(
        SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',  # Changed back to 'Lax' for HTTP development
        SESSION_COOKIE_NAME='session',
        PERMANENT_SESSION_LIFETIME=timedelta(days=7),
        SESSION_REFRESH_EACH_REQUEST=True,
        SESSION_COOKIE_PATH='/',
        SESSION_COOKIE_DOMAIN=None  # Important for localhost testing
    )
    
    with app.app_context():
        from . import routes, models
        print("Creating database tables...") # Debug print
        db.create_all()
        print("Database tables created successfully") # Debug print
        # Print existing users
        from .models import User
        users = User.query.all()
        print(f"Existing users: {[user.username for user in users]}") # Debug print

    return app