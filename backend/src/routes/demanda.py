from flask import Blueprint, jsonify, request
from src.routes.user import token_required
from src.models.demanda import Demanda, db
from datetime import datetime

demanda_bp = Blueprint("demanda", __name__)

@demanda_bp.route("/demandas", methods=["POST"])
@token_required
def create_demanda():
    data = request.json
    if not data or not data.get("titulo") or not data.get("descricao") or not data.get("criterios_julgamento") or not data.get("prazo_propostas") or not data.get("condominio_id"):
        return jsonify({"error": "Missing data"}), 400

    try:
        prazo_propostas = datetime.fromisoformat(data["prazo_propostas"])
    except ValueError:
        return jsonify({"error": "Invalid date format for prazo_propostas. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400

    demanda = Demanda(
        titulo=data["titulo"],
        descricao=data["descricao"],
        criterios_julgamento=data["criterios_julgamento"],
        prazo_propostas=prazo_propostas,
        condominio_id=data["condominio_id"]
    )
    db.session.add(demanda)
    db.session.commit()
    return jsonify(demanda.to_dict()), 201

@demanda_bp.route("/demandas", methods=["GET"])
@token_required
def get_demandas():
    demandas = Demanda.query.all()
    return jsonify([demanda.to_dict() for demanda in demandas])

@demanda_bp.route("/demandas/<int:demanda_id>", methods=["GET"])
@token_required
def get_demanda(demanda_id):
    demanda = Demanda.query.get_or_404(demanda_id)
    return jsonify(demanda.to_dict())

@demanda_bp.route("/demandas/<int:demanda_id>", methods=["PUT"])
@token_required
def update_demanda(demanda_id):
    demanda = Demanda.query.get_or_404(demanda_id)
    data = request.json
    demanda.titulo = data.get("titulo", demanda.titulo)
    demanda.descricao = data.get("descricao", demanda.descricao)
    demanda.criterios_julgamento = data.get("criterios_julgamento", demanda.criterios_julgamento)
    if "prazo_propostas" in data:
        try:
            demanda.prazo_propostas = datetime.fromisoformat(data["prazo_propostas"])
        except ValueError:
            return jsonify({"error": "Invalid date format for prazo_propostas. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400
    demanda.status = data.get("status", demanda.status)
    db.session.commit()
    return jsonify(demanda.to_dict())

@demanda_bp.route("/demandas/<int:demanda_id>", methods=["DELETE"])
@token_required
def delete_demanda(demanda_id):
    demanda = Demanda.query.get_or_404(demanda_id)
    db.session.delete(demanda)
    db.session.commit()
    return "", 204

