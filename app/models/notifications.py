from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class Notification(db.Model):
    __tablename__ = 'notifications'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False) #in production, want to reference correct table
    message = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(250), nullable=False)
    created_at = db.Column(DateTime, default=func.now())
    read_at = db.Column(DateTime)

    # RELATIONSHIP
    user = db.relationship("User", back_populates="notifications") #passive_delete Makes SQLAlchemy respect DB-level cascade
