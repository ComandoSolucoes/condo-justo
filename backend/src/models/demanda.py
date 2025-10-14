from src.models import db
from datetime import datetime

class Demanda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    criterios_julgamento = db.Column(db.String(255), nullable=False)
    prazo_propostas = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default='Planejamento') # Planejamento, Cotação, Julgamento, Votação, Concluída
    condominio_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'criterios_julgamento': self.criterios_julgamento,
            'prazo_propostas': self.prazo_propostas.isoformat(),
            'status': self.status,
            'condominio_id': self.condominio_id
        }

