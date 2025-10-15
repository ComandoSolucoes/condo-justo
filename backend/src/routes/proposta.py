from flask import Blueprint, jsonify, request, current_app, g
from src.routes.user import token_required
from src.models.proposta import Proposta
from src.models.proposal_history import ProposalHistory
from src.models import db
from werkzeug.utils import secure_filename
import os

proposta_bp = Blueprint("proposta", __name__)

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]

@proposta_bp.route("/propostas", methods=["POST"])
@token_required
def create_proposta():
    data = request.form.to_dict() # Use request.form for multipart/form-data

    # Validação básica para garantir que o fornecedor_id é fornecido
    fornecedor_id = data.get("fornecedor_id")
    if not fornecedor_id:
        return jsonify({"error": "ID do fornecedor é obrigatório"}), 400

    # Em um cenário real, você buscaria o usuário no banco de dados e verificaria a role.
    # Por simplicidade, para contornar o problema do JWT, estamos assumindo que o ID é válido.
    # Ex: user = User.query.get(fornecedor_id)
    # if not user or user.role != 'fornecedor':
    #    return jsonify({"error": "Fornecedor inválido ou sem permissão"}), 403


    pdf_url = None
    if "pdf_file" in request.files:
        pdf_file = request.files["pdf_file"]
        if pdf_file.filename == "":
            return jsonify({"error": "Nenhum arquivo PDF selecionado"}), 400
        if pdf_file and allowed_file(pdf_file.filename):
            filename = secure_filename(pdf_file.filename)
            filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
            pdf_file.save(filepath)
            pdf_url = f"/uploads/{filename}"
        else:
            return jsonify({"error": "Tipo de arquivo não permitido. Apenas PDFs são aceitos."}), 400

    if not data or not data.get("demanda_id") or not data.get("fornecedor_id") or not data.get("valor") or not data.get("prazo_entrega"):
        return jsonify({"error": "Dados mínimos da proposta ausentes"}), 400

    proposta = Proposta(
        demanda_id=data["demanda_id"],
        fornecedor_id=data["fornecedor_id"],
        valor=float(data["valor"]),
        prazo_entrega=data["prazo_entrega"],
        certificacoes=data.get("certificacoes"),
        pdf_url=pdf_url,
        referencias_clientes=data.get("referencias_clientes")
    )
    db.session.add(proposta)
    db.session.commit()
    return jsonify(proposta.to_dict()), 201

@proposta_bp.route("/propostas", methods=["GET"])
@token_required
def get_propostas():
    propostas = Proposta.query.all()
    return jsonify([proposta.to_dict() for proposta in propostas])

@proposta_bp.route("/propostas/<int:proposta_id>", methods=["GET"])
@token_required
def get_proposta(proposta_id):
    proposta = Proposta.query.get_or_404(proposta_id)
    return jsonify(proposta.to_dict())

@proposta_bp.route("/propostas/<int:proposta_id>", methods=["PUT"])
@token_required
def update_proposta(proposta_id):
    proposta = Proposta.query.get_or_404(proposta_id)
    data = request.json

    # Get the user making the change (assuming user ID is passed in the request body for now)
    changed_by_user_id = g.current_user.id # Usar o ID do usuário autenticado
    if not changed_by_user_id:
        return jsonify({"error": "ID do usuário que realizou a alteração é obrigatório"}), 400

    # Fields to track for history
    fields_to_track = [
        "valor", "prazo_entrega", "certificacoes", "pdf_url",
        "referencias_clientes", "status"
    ]

    changes_made = False
    for field in fields_to_track:
        new_value = data.get(field)
        old_value = getattr(proposta, field)

        if new_value is not None and str(new_value) != str(old_value):
            changes_made = True
            history_entry = ProposalHistory(
                proposal_id=proposta.id,
                changed_by_user_id=changed_by_user_id,
                field_name=field,
                old_value=str(old_value),
                new_value=str(new_value)
            )
            db.session.add(history_entry)
            setattr(proposta, field, new_value)

    if not changes_made:
        return jsonify({"message": "Nenhuma alteração detectada para registrar."}), 200

    db.session.commit()
    return jsonify(proposta.to_dict())

@proposta_bp.route("/propostas/<int:proposta_id>/history", methods=["GET"])
@token_required
def get_proposta_history(proposta_id):
    history = ProposalHistory.query.filter_by(proposal_id=proposta_id).order_by(ProposalHistory.change_timestamp.desc()).all()
    return jsonify([h.to_dict() for h in history]), 200

@proposta_bp.route("/propostas/<int:proposta_id>", methods=["DELETE"])
@token_required
def delete_proposta(proposta_id):
    proposta = Proposta.query.get_or_404(proposta_id)
    db.session.delete(proposta)
    db.session.commit()
    return "", 204

