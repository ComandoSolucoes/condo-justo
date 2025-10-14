from src.main import app
from src.models.user import db
from src.models.proposal_history import ProposalHistory

with app.app_context():
    db.create_all()
    ProposalHistory.__table__.create(db.engine, checkfirst=True)
    print("Database tables created.")

