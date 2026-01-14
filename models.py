from app import db
from datetime import datetime

class WhatsAppGroup(db.Model):
    __tablename__ = 'whatsapp_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    group_url = db.Column(db.String(500), nullable=False, unique=True)
    image_url = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(100), nullable=True, default='General')
    country = db.Column(db.String(100), nullable=True, default='Global')
    member_count = db.Column(db.Integer, nullable=True, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'group_url': self.group_url,
            'image_url': self.image_url,
            'category': self.category,
            'country': self.country,
            'member_count': self.member_count,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<WhatsAppGroup {self.title}>'