from flask import Blueprint, jsonify, request, g
import secrets
from functools import wraps
from src.models.user import User, db
from datetime import datetime, timedelta

user_bp = Blueprint("user", __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        user = User.query.filter_by(token=token).first()

        if not user or user.token_expiration < datetime.utcnow():
            return jsonify({'message': 'Token is invalid or expired!'}), 401

        g.current_user = user
        return f(*args, **kwargs)

    return decorated



@user_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data or not data.get("username") or not data.get("password") or not data.get("email") or not data.get("user_type"):
        return jsonify({"error": "Missing data"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(
        username=data["username"],
        email=data["email"],
        user_type=data["user_type"]
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing data"}), 400

    print(f"Attempting login for email: {data['email']}")
    user = User.query.filter_by(email=data["email"]).first()
    if user:
        print(f"User found: {user.username}, type: {user.user_type}")
    else:
        print("User not found")

    if not user or not user.check_password(data["password"]):
        print(f"Password check failed for user {user.username if user else 'N/A'}")
        return jsonify({"error": "Invalid credentials"}), 401

    user.token = secrets.token_hex(16)
    user.token_expiration = datetime.utcnow() + timedelta(hours=1) # Token válido por 1 hora
    db.session.commit()

    return jsonify({"message": "Login successful", "user": user.to_dict(), "token": user.token})

