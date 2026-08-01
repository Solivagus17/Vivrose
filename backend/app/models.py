from datetime import datetime

from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB

from .db import db

JSON_TYPE = JSON().with_variant(JSONB(), 'postgresql')


def _now():
    return datetime.utcnow()


class TimestampMixin:
    created_at = db.Column(db.DateTime(timezone=True), default=_now)
    updated_at = db.Column(db.DateTime(timezone=True), default=_now, onupdate=_now)


class Household(db.Model, TimestampMixin):
    __tablename__ = 'households'
    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False, default='My Family')


class Profile(db.Model, TimestampMixin):
    __tablename__ = 'profiles'
    id = db.Column(db.Text, primary_key=True)  # Firebase uid
    household_id = db.Column(db.Text, db.ForeignKey('households.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text)


class FamilyMember(db.Model, TimestampMixin):
    __tablename__ = 'family_members'
    id = db.Column(db.Text, primary_key=True)
    household_id = db.Column(db.Text, db.ForeignKey('households.id', ondelete='CASCADE'), nullable=False)

    name = db.Column(db.Text, nullable=False)
    relation = db.Column(db.Text, nullable=False, default='Family')
    sex = db.Column(db.Text)
    birth_date = db.Column(db.Date)
    birth_location = db.Column(db.Text)
    location = db.Column(db.Text)

    age = db.Column(db.Integer)
    initials = db.Column(db.Text)
    avatar = db.Column(db.Text)

    level = db.Column(db.Text)
    risk = db.Column(db.Text)
    status = db.Column(db.Text)
    assessed = db.Column(db.DateTime(timezone=True))
    last_assessed = db.Column(db.Text)

    bmi = db.Column(db.Text)
    bmi_class = db.Column(db.Text)
    bp = db.Column(db.Text)
    hba1c = db.Column(db.Text)
    glucose = db.Column(db.Text)
    cholesterol = db.Column(db.Text)
    creatinine = db.Column(db.Text)
    smoking = db.Column(db.Text)

    conditions = db.Column(JSON_TYPE, default=list)
    medications = db.Column(JSON_TYPE, default=list)
    family_history = db.Column(JSON_TYPE, default=list)
    summary = db.Column(db.Text)
    report_summary = db.Column(db.Text)
    findings = db.Column(JSON_TYPE, default=list)
    checkup_list = db.Column(JSON_TYPE, default=list)
    recommendation_list = db.Column(JSON_TYPE, default=list)
    lifestyle = db.Column(JSON_TYPE, default=list)

    scores = db.Column(JSON_TYPE, default=list)
    factors = db.Column(JSON_TYPE, default=list)
    checkups = db.Column(JSON_TYPE, default=list)
    warnings = db.Column(JSON_TYPE, default=list)
    recommendations = db.Column(JSON_TYPE, default=list)


class InsightSnapshot(db.Model):
    __tablename__ = 'insight_snapshots'
    id = db.Column(db.Text, primary_key=True)
    household_id = db.Column(db.Text, db.ForeignKey('households.id', ondelete='CASCADE'), nullable=False)
    member_id = db.Column(db.Text, db.ForeignKey('family_members.id', ondelete='CASCADE'))
    member_name = db.Column(db.Text)
    member_initials = db.Column(db.Text)
    snapshot = db.Column(JSON_TYPE, nullable=False, default=dict)
    created_at = db.Column(db.DateTime(timezone=True), default=_now)


class Doctor(db.Model, TimestampMixin):
    __tablename__ = 'doctors'
    id = db.Column(db.Text, primary_key=True)
    household_id = db.Column(db.Text, db.ForeignKey('households.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.Text, nullable=False)
    specialty = db.Column(db.Text, nullable=False)
    hospital = db.Column(db.Text)
    phone = db.Column(db.Text)
    email = db.Column(db.Text)
    city = db.Column(db.Text)
    notes = db.Column(db.Text)


class Checkup(db.Model, TimestampMixin):
    __tablename__ = 'checkups'
    id = db.Column(db.Text, primary_key=True)
    household_id = db.Column(db.Text, db.ForeignKey('households.id', ondelete='CASCADE'), nullable=False)
    doctor_id = db.Column(db.Text, db.ForeignKey('doctors.id', ondelete='SET NULL'))
    doctor_name = db.Column(db.Text)
    purpose = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date)
    time = db.Column(db.Text)
    location = db.Column(db.Text)
    notes = db.Column(db.Text)
    status = db.Column(db.Text, nullable=False, default='Scheduled')


class Medicine(db.Model, TimestampMixin):
    __tablename__ = 'medicines'
    id = db.Column(db.Text, primary_key=True)
    household_id = db.Column(db.Text, db.ForeignKey('households.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.Text, nullable=False)
    purpose = db.Column(db.Text)
    dosage = db.Column(db.Text)
    frequency = db.Column(db.Text)
    timing = db.Column(db.Text)
    prescribed_by = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    status = db.Column(db.Text, nullable=False, default='Active')
    remark = db.Column(db.Text)


class Report(db.Model, TimestampMixin):
    __tablename__ = 'reports'
    id = db.Column(db.Text, primary_key=True)
    household_id = db.Column(db.Text, db.ForeignKey('households.id', ondelete='CASCADE'), nullable=False)
    file_name = db.Column(db.Text, nullable=False)
    file_size = db.Column(db.Text)
    report_type = db.Column(db.Text)
    date = db.Column(db.Date)
    hospital = db.Column(db.Text)
    doctor = db.Column(db.Text)
    purpose = db.Column(db.Text)
    remark = db.Column(db.Text)
    storage_path = db.Column(db.Text)
