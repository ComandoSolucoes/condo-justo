from src.models import db
from sqlalchemy.orm import relationship
from .user import User
from .demanda import Demanda




class Proposta(db.Model):
    __tablename__ = 'propostas'
    id = db.Column(db.Integer, primary_key=True)
    demanda_id = db.Column(db.Integer, db.ForeignKey("demanda.id"), nullable=False)
    fornecedor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    prazo_entrega = db.Column(db.String(100), nullable=False)
    certificacoes = db.Column(db.Text, nullable=True)
    pdf_url = db.Column(db.String(255), nullable=True)
    referencias_clientes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="Pendente")

    # Relacionamento com o histórico de propostas
    history = db.relationship("ProposalHistory", back_populates="proposal", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "demanda_id": self.demanda_id,
            "fornecedor_id": self.fornecedor_id,
            "valor": self.valor,
            "prazo_entrega": self.prazo_entrega,
            "certificacoes": self.certificacoes,
            "pdf_url": self.pdf_url,
            "referencias_clientes": self.referencias_clientes,
            "status": self.status
        }

