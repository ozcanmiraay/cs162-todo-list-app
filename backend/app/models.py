from . import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    lists = db.relationship('TodoList', backref='owner', lazy=True)

class TodoList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Update the relationship to cascade delete
    items = db.relationship('TodoItem', backref='list', 
                           cascade='all, delete-orphan',
                           lazy='dynamic')
    
    def __repr__(self):
        return f'<TodoList {self.name}>'

class TodoItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    complete = db.Column(db.Boolean, default=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('todo_item.id'), nullable=True)
    list_id = db.Column(db.Integer, db.ForeignKey('todo_list.id'), nullable=False)
    # Self-referential relationship for sub-items (max depth will be enforced via logic)
    children = db.relationship('TodoItem', backref=db.backref('parent', remote_side=[id]), lazy=True)