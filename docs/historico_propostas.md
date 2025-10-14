# Documentação da Funcionalidade de Histórico de Propostas

## Introdução

Este documento detalha a implementação do sistema de rastreamento do histórico de propostas e a funcionalidade de atualização para o aplicativo web "Condo Justo". Esta funcionalidade permite que os usuários acompanhem as alterações feitas nas propostas ao longo do tempo, fornecendo transparência e rastreabilidade.

## Modelo de Dados

A funcionalidade de histórico de propostas é suportada por dois modelos principais: `Proposta` e `ProposalHistory`.

### Proposta

O modelo `Proposta` foi atualizado para incluir um relacionamento com o `ProposalHistory`, permitindo que cada proposta tenha um histórico de alterações associado.

```python
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

    history = db.relationship("ProposalHistory", back_populates="proposal", lazy=True)

    # ... outros campos e métodos
```

### ProposalHistory

O modelo `ProposalHistory` armazena os detalhes de cada alteração feita em uma proposta. Ele inclui informações sobre qual proposta foi alterada, quem fez a alteração, quando ocorreu e quais campos foram modificados.

```python
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

    # ... outros métodos
```

## Lógica de Negócios

A lógica para registrar as alterações no histórico é implementada na rota de atualização de propostas (`/api/propostas/<int:proposta_id>`). Antes de salvar as alterações em uma proposta, o sistema compara os valores antigos com os novos. Se houver alguma diferença, um novo registro `ProposalHistory` é criado para cada campo modificado.

## Endpoints da API

### `GET /api/propostas/<int:proposta_id>/history`

Este endpoint retorna o histórico de alterações para uma proposta específica. Ele é acessível por usuários autenticados e fornece uma lista de objetos `ProposalHistory`.

### `PUT /api/propostas/<int:proposta_id>`

Este endpoint permite a atualização de uma proposta existente. Além de atualizar os campos da proposta, ele também registra as alterações no `ProposalHistory`.

## Interface do Usuário (Frontend)

No frontend, o componente `DashboardFornecedor.jsx` foi atualizado para exibir o histórico de atualizações de uma proposta. Ao visualizar os detalhes de uma proposta, uma seção "Histórico de Atualizações" mostra as alterações, incluindo a data/hora, o campo alterado e os valores antigo e novo.

## Testes

A funcionalidade foi testada com sucesso, verificando que:

*   As alterações nas propostas são corretamente registradas no histórico.
*   O histórico é exibido de forma clara na interface do usuário.
*   Os relacionamentos entre os modelos `Proposta`, `ProposalHistory` e `User` estão funcionando conforme o esperado.

## Conclusão

A funcionalidade de histórico de propostas adiciona uma camada importante de rastreabilidade e transparência ao sistema Condo Justo, permitindo que os usuários acompanhem todas as modificações feitas nas propostas.
