from src.models import db
from sqlalchemy.orm import relationship
from datetime import datetime

class ProposalHistory(db.Model):
    __tablename__ = 'proposal_history'

    id = db.Column(db.Integer, primary_key=True, index=True)
    proposal_id = db.Column(db.Integer, db.ForeignKey('propostas.id'))
    changed_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    change_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    field_name = db.Column(db.String)
    old_value = db.Column(db.Text)
    new_value = db.Column(db.Text)

    proposal = relationship('Proposta', back_populates='history', lazy=True)
    changed_by = relationship('User', back_populates='history_changes', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "proposal_id": self.proposal_id,
            "changed_by_user_id": self.changed_by_user_id,
            "change_timestamp": self.change_timestamp.isoformat() if self.change_timestamp else None,
            "field_name": self.field_name,
            "old_value": self.old_value,
            "new_value": self.new_value
        }

