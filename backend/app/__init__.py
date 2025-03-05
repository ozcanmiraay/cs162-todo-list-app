from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')  # Load configuration from config.py

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'login'

    # Import routes and models
    with app.app_context():
        from . import routes, models
        db.create_all()  # Creates database tables if they don't exist

    return app