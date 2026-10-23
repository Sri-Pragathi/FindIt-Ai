from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import datetime
import os
from models import db, User, LostItemReport, FoundItemReport, ItemMatch, ClaimRequest, VerificationQuestion, VerificationAnswer, HandoverProposal, NotificationItem, CampusLocation
from matching import evaluate_match

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'finditai-secret-key-2026')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///finditai.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'FindItAi Python/Flask REST API', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    session['user_id'] = user.id
    return jsonify({'user': user.to_dict(), 'token': f'token_{user.id}'})

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()
    role = data.get('role', 'student')
    college = data.get('college', 'Siddhartha University')
    department = data.get('department', '')

    if not email or not name:
        return jsonify({'error': 'Name and email are required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User with this email already exists'}), 409

    user = User(name=name, email=email, role=role, college=college, department=department)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    return jsonify({'user': user.to_dict(), 'token': f'token_{user.id}'}), 201

@app.route('/api/items/lost', methods=['GET', 'POST'])
def lost_items():
    if request.method == 'GET':
        category = request.args.get('category')
        location = request.args.get('location')
        query = LostItemReport.query
        if category and category != 'All':
            query = query.filter_by(category=category)
        if location and location != 'All':
            query = query.filter_by(location=location)
        items = query.order_by(LostItemReport.created_at.desc()).all()
        return jsonify([i.to_dict() for i in items])
    else:
        data = request.get_json() or {}
        report = LostItemReport(
            title=data.get('title'),
            category=data.get('category'),
            description=data.get('description'),
            date_lost=data.get('dateLost'),
            time_lost=data.get('timeLost'),
            location=data.get('location'),
            location_detail=data.get('locationDetail'),
            brand=data.get('brand'),
            color=data.get('color'),
            distinguishing_features=data.get('distinguishingFeatures'),
            secret_clues=data.get('secretClues'),
            photo_url=data.get('photoUrl'),
            reported_by=data.get('reportedBy'),
            reporter_name=data.get('reporterName', 'Student'),
            reporter_email=data.get('reporterEmail', 'student@campus.edu'),
            reporter_role=data.get('reporterRole', 'student')
        )
        db.session.add(report)
        db.session.commit()
        return jsonify(report.to_dict()), 201

@app.route('/api/items/found', methods=['GET', 'POST'])
def found_items():
    if request.method == 'GET':
        category = request.args.get('category')
        location = request.args.get('location')
        query = FoundItemReport.query
        if category and category != 'All':
            query = query.filter_by(category=category)
        if location and location != 'All':
            query = query.filter_by(location=location)
        items = query.order_by(FoundItemReport.created_at.desc()).all()
        return jsonify([i.to_dict() for i in items])
    else:
        data = request.get_json() or {}
        report = FoundItemReport(
            title=data.get('title'),
            category=data.get('category'),
            description=data.get('description'),
            date_found=data.get('dateFound'),
            time_found=data.get('timeFound'),
            location=data.get('location'),
            location_detail=data.get('locationDetail'),
            brand=data.get('brand'),
            color=data.get('color'),
            distinguishing_features=data.get('distinguishingFeatures'),
            secret_clues=data.get('secretClues'),
            photo_url=data.get('photoUrl'),
            custody_status=data.get('custodyStatus', 'with_finder'),
            contact_preference=data.get('contactPreference'),
            reported_by=data.get('reportedBy'),
            reporter_name=data.get('reporterName', 'Finder'),
            reporter_email=data.get('reporterEmail', 'finder@campus.edu'),
            reporter_role=data.get('reporterRole', 'student')
        )
        db.session.add(report)
        db.session.commit()
        return jsonify(report.to_dict()), 201

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
