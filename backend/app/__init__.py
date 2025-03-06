from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    # Configure CORS
    CORS(app, 
         resources={
             r"/*": {
                 "origins": "http://localhost:3000",
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Accept"],
                 "supports_credentials": True
             }
         })

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = None
    login_manager.session_protection = "strong"

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