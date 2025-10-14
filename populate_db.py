from src.main import app
from src.models.user import db, User
from src.models.demanda import Demanda
from src.models.proposta import Proposta
from datetime import datetime, timedelta

with app.app_context():
    # Limpar tabelas existentes (opcional, para garantir um estado limpo)
    db.drop_all()
    db.create_all()

    # Criar usuários de teste
    sindico = User(username='sindico_teste', email='sindico@condojusto.com')
    sindico.user_type = 'Síndico'
    sindico.set_password('senha123')
    db.session.add(sindico)

    morador = User(username='morador_teste', email='morador@condojusto.com')
    morador.user_type = 'Morador'
    morador.set_password('senha123')
    db.session.add(morador)

    fornecedor = User(username='fornecedor_teste', email='fornecedor@condojusto.com')
    fornecedor.user_type = 'Fornecedor'
    fornecedor.set_password('senha123')
    db.session.add(fornecedor)

    db.session.commit()

    # Criar demandas de teste
    demanda1 = Demanda(
        titulo='Reforma da Área Comum',
        descricao='Necessidade de reforma da área de lazer do condomínio.',
        criterios_julgamento='Preço, Prazo, Qualidade dos Materiais',
        prazo_propostas=datetime.now() + timedelta(days=15),
        condominio_id=sindico.id
    )
    db.session.add(demanda1)

    demanda2 = Demanda(
        titulo='Manutenção de Elevadores',
        descricao='Contratação de empresa para manutenção preventiva e corretiva dos elevadores.',
        criterios_julgamento='Experiência, Preço, Tempo de Resposta',
        prazo_propostas=datetime.now() + timedelta(days=10),
        condominio_id=sindico.id,
        status='Cotação'
    )
    db.session.add(demanda2)

    db.session.commit()

    # Criar propostas de teste
    proposta1 = Proposta(
        demanda_id=demanda2.id,
        fornecedor_id=fornecedor.id,
        valor=5000.00,
        prazo_entrega='30 dias',
        certificacoes='ISO 9001',
        status='Pendente'
    )
    db.session.add(proposta1)

    db.session.commit()

    print("Banco de dados populado com sucesso!")

