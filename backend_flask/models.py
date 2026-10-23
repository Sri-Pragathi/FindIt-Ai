from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(32), default='student')
    college = db.Column(db.String(120), default='Siddhartha University')
    department = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'college': self.college,
            'department': self.department
        }

class LostItemReport(db.Model):
    __tablename__ = 'lost_items'
    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date_lost = db.Column(db.String(32), nullable=False)
    time_lost = db.Column(db.String(32))
    location = db.Column(db.String(150), nullable=False)
    location_detail = db.Column(db.String(255))
    brand = db.Column(db.String(100))
    color = db.Column(db.String(50))
    distinguishing_features = db.Column(db.Text)
    secret_clues = db.Column(db.Text)
    photo_url = db.Column(db.Text)
    status = db.Column(db.String(32), default='open')
    reported_by = db.Column(db.String(64), db.ForeignKey('users.id'))
    reporter_name = db.Column(db.String(120))
    reporter_email = db.Column(db.String(120))
    reporter_role = db.Column(db.String(32))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'description': self.description,
            'dateLost': self.date_lost,
            'timeLost': self.time_lost,
            'location': self.location,
            'locationDetail': self.location_detail,
            'brand': self.brand,
            'color': self.color,
            'distinguishingFeatures': self.distinguishing_features,
            'secretClues': self.secret_clues,
            'photoUrl': self.photo_url,
            'status': self.status,
            'reportedBy': self.reported_by,
            'reporterName': self.reporter_name,
            'reporterEmail': self.reporter_email,
            'reporterRole': self.reporter_role,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class FoundItemReport(db.Model):
    __tablename__ = 'found_items'
    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date_found = db.Column(db.String(32), nullable=False)
    time_found = db.Column(db.String(32))
    location = db.Column(db.String(150), nullable=False)
    location_detail = db.Column(db.String(255))
    brand = db.Column(db.String(100))
    color = db.Column(db.String(50))
    distinguishing_features = db.Column(db.Text)
    secret_clues = db.Column(db.Text)
    photo_url = db.Column(db.Text)
    custody_status = db.Column(db.String(64), default='with_finder')
    contact_preference = db.Column(db.String(255))
    status = db.Column(db.String(32), default='available')
    reported_by = db.Column(db.String(64), db.ForeignKey('users.id'))
    reporter_name = db.Column(db.String(120))
    reporter_email = db.Column(db.String(120))
    reporter_role = db.Column(db.String(32))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'description': self.description,
            'dateFound': self.date_found,
            'timeFound': self.time_found,
            'location': self.location,
            'locationDetail': self.location_detail,
            'brand': self.brand,
            'color': self.color,
            'distinguishingFeatures': self.distinguishing_features,
            'secretClues': self.secret_clues,
            'photoUrl': self.photo_url,
            'custodyStatus': self.custody_status,
            'contactPreference': self.contact_preference,
            'status': self.status,
            'reportedBy': self.reported_by,
            'reporterName': self.reporter_name,
            'reporterEmail': self.reporter_email,
            'reporterRole': self.reporter_role,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class ItemMatch(db.Model):
    __tablename__ = 'matches'
    id = db.Column(db.String(64), primary_key=True)
    lost_report_id = db.Column(db.String(64), db.ForeignKey('lost_items.id'))
    found_report_id = db.Column(db.String(64), db.ForeignKey('found_items.id'))
    score = db.Column(db.Integer, nullable=False)
    confidence_level = db.Column(db.String(32))
    status = db.Column(db.String(32), default='suggested')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ClaimRequest(db.Model):
    __tablename__ = 'claims'
    id = db.Column(db.String(64), primary_key=True)
    lost_report_id = db.Column(db.String(64), db.ForeignKey('lost_items.id'))
    found_report_id = db.Column(db.String(64), db.ForeignKey('found_items.id'))
    claimant_id = db.Column(db.String(64), db.ForeignKey('users.id'))
    finder_id = db.Column(db.String(64), db.ForeignKey('users.id'))
    stage = db.Column(db.String(64), default='1_MATCH_DISCOVERED')
    status = db.Column(db.String(32), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class VerificationQuestion(db.Model):
    __tablename__ = 'verification_questions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    claim_id = db.Column(db.String(64), db.ForeignKey('claims.id'))
    question = db.Column(db.Text, nullable=False)
    asked_at = db.Column(db.DateTime, default=datetime.utcnow)

class VerificationAnswer(db.Model):
    __tablename__ = 'verification_answers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    claim_id = db.Column(db.String(64), db.ForeignKey('claims.id'))
    answer = db.Column(db.Text, nullable=False)
    evidence_notes = db.Column(db.Text)
    status = db.Column(db.String(32), default='submitted')
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

class HandoverProposal(db.Model):
    __tablename__ = 'handover_proposals'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    claim_id = db.Column(db.String(64), db.ForeignKey('claims.id'))
    location = db.Column(db.String(150), nullable=False)
    meeting_date = db.Column(db.String(32), nullable=False)
    meeting_time = db.Column(db.String(32), nullable=False)
    instructions = db.Column(db.Text)
    owner_confirmed = db.Column(db.Boolean, default=False)
    finder_confirmed = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(32), default='proposed')

class NotificationItem(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.String(64), primary_key=True)
    recipient_id = db.Column(db.String(64), db.ForeignKey('users.id'))
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notif_type = db.Column(db.String(64), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CampusLocation(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    building = db.Column(db.String(150), nullable=False)
    hours = db.Column(db.String(100))
    is_official_safe_spot = db.Column(db.Boolean, default=True)
