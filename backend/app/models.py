from . import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    """
    User model for authentication and ownership of todo lists.
    
    Attributes:
        id (int): Primary key for the user
        username (str): Unique username for login
        password (str): Hashed password for authentication
        lists (relationship): One-to-many relationship with TodoList
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    lists = db.relationship('TodoList', backref='owner', lazy=True)

class TodoList(db.Model):
    """
    TodoList model representing a collection of todo items.
    
    Attributes:
        id (int): Primary key for the list
        name (str): Name of the todo list
        user_id (int): Foreign key to the owner User
        items (relationship): One-to-many relationship with TodoItem
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Update the relationship to cascade delete
    items = db.relationship('TodoItem', backref='list', 
                           cascade='all, delete-orphan',
                           lazy='dynamic')
    
    def __repr__(self):
        return f'<TodoList {self.name}>'

    def to_dict(self):
        """
        Convert the list and its items to a dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the list with its items
        """
        return {
            'id': self.id,
            'name': self.name,
            'items': [item.to_dict() for item in self.items]
        }

class TodoItem(db.Model):
    """
    TodoItem model representing an individual task in a todo list.
    Supports hierarchical structure with parent-child relationships.
    
    Attributes:
        id (int): Primary key for the item
        description (str): Description of the todo item
        complete (bool): Completion status of the item
        parent_id (int): Foreign key to parent TodoItem (for hierarchical structure)
        list_id (int): Foreign key to the containing TodoList
        children (relationship): One-to-many self-referential relationship for sub-items
    """
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    complete = db.Column(db.Boolean, default=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('todo_item.id'), nullable=True)
    list_id = db.Column(db.Integer, db.ForeignKey('todo_list.id'), nullable=False)
    
    # Self-referential relationship for sub-items (max depth enforced via logic)
    children = db.relationship('TodoItem', backref=db.backref('parent', remote_side=[id]), lazy=True)
    
    def to_dict(self):
        """
        Convert the item and its children to a dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the item with its children
        """
        return {
            'id': self.id,
            'description': self.description,
            'complete': self.complete,
            'parent_id': self.parent_id,
            'children': [child.to_dict() for child in self.children]
        }