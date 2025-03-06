from flask import render_template, redirect, url_for, request, flash, jsonify, make_response
from flask_login import login_user, logout_user, login_required, current_user
from .models import User, TodoList, TodoItem
from . import db, login_manager
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin

from flask import current_app as app

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized access'}), 401

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Todo List App!"})

@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Accept')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f"User {username} already exists")  # Debug print
            return jsonify({'error': 'Username already exists'}), 409  # Changed to 409 Conflict

        # Create new user
        new_user = User(
            username=username,
            password=generate_password_hash(password)
        )
        db.session.add(new_user)
        db.session.commit()
        print(f"Successfully created user {username}")  # Debug print
        
        response = jsonify({'message': 'Registration successful'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 201
            
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Accept')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user, remember=True)
            response = jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username
                }
            })
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error occurred'}), 500

@app.route('/logout', methods=['POST'])
def logout():
    try:
        logout_user()
        response = jsonify({'message': 'Logged out successfully'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed'}), 500

# Dashboard: show the user's todo lists
@app.route('/dashboard')
@login_required
def dashboard():
    # Should return JSON instead of template
    lists = TodoList.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'lists': [
            {
                'id': lst.id,
                'name': lst.name,
                'items': [
                    {
                        'id': item.id,
                        'description': item.description,
                        'complete': item.complete,
                        'children': [
                            {
                                'id': child.id,
                                'description': child.description,
                                'complete': child.complete
                            } for child in item.children
                        ]
                    } for item in lst.items if item.parent_id is None
                ]
            } for lst in lists
        ]
    })

@app.route('/list/new', methods=['POST'])
@login_required
def new_list():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'List name is required'}), 400
        
    new_list = TodoList(name=name, user_id=current_user.id)
    db.session.add(new_list)
    db.session.commit()
    return jsonify({'message': 'List created successfully', 'id': new_list.id}), 201

@app.route('/list/<int:list_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_list(list_id):
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    if request.method == 'POST':
        new_name = request.form.get('name')
        if new_name:
            todo_list.name = new_name
            db.session.commit()
            flash('List updated successfully!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('List name cannot be empty', 'warning')
    return render_template('edit_list.html', list=todo_list)

@app.route('/list/<int:list_id>/delete', methods=['POST'])
@login_required
def delete_list(list_id):
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    db.session.delete(todo_list)
    db.session.commit()
    flash('List deleted successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/list/<int:list_id>/item/new', methods=['GET', 'POST'])
@login_required
def new_item(list_id):
    # Ensure the list belongs to the current user
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    if request.method == 'POST':
        description = request.form.get('description')
        if not description:
            flash('Description is required!', 'warning')
            return redirect(url_for('new_item', list_id=list_id))
        # For a top-level item, parent_id remains None
        new_item = TodoItem(description=description, list_id=todo_list.id)
        db.session.add(new_item)
        db.session.commit()
        flash('New task added successfully!', 'success')
        return redirect(url_for('dashboard'))
    return render_template('new_item.html', list=todo_list)

@app.route('/item/<int:item_id>/complete', methods=['POST'])
@login_required
def complete_item(item_id):
    item = TodoItem.query.get_or_404(item_id)
    # Ensure that the item belongs to a list owned by the current user.
    if item.list.user_id != current_user.id:
        flash('You are not authorized to modify this task.', 'danger')
        return redirect(url_for('dashboard'))
    item.complete = True
    db.session.commit()
    flash('Task marked as complete!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/item/<int:parent_id>/subitem/new', methods=['GET', 'POST'])
@login_required
def new_subitem(parent_id):
    parent_item = TodoItem.query.get_or_404(parent_id)
    # Validate that the parent item belongs to the current user
    if parent_item.list.user_id != current_user.id:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Check the hierarchy depth by traversing the parent chain
    depth = 1
    current = parent_item
    while current.parent is not None:
        depth += 1
        current = current.parent
    if depth >= 3:
        flash('Maximum hierarchy depth reached (3 levels).', 'warning')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        description = request.form.get('description')
        if not description:
            flash('Description is required!', 'warning')
            return redirect(url_for('new_subitem', parent_id=parent_id))
        new_subitem = TodoItem(description=description, list_id=parent_item.list_id, parent_id=parent_id)
        db.session.add(new_subitem)
        db.session.commit()
        flash('New subtask added!', 'success')
        return redirect(url_for('dashboard'))
    return render_template('new_subitem.html', parent=parent_item)

@app.route('/item/<int:item_id>/edit', methods=['POST'])
@login_required
def edit_item(item_id):
    item = TodoItem.query.get_or_404(item_id)
    # Ensure the item belongs to a list owned by the current user
    if item.list.user_id != current_user.id:
        return {'error': 'Unauthorized'}, 403
        
    data = request.get_json()
    if 'description' in data:
        item.description = data['description']
        db.session.commit()
        return {'message': 'Item updated successfully'}, 200
    return {'error': 'Description is required'}, 400

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500