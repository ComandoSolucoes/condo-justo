import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

function DashboardFornecedor({ user, onLogout }) {
  const [demandas, setDemandas] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDemanda, setSelectedDemanda] = useState(null);
  const [selectedProposta, setSelectedProposta] = useState(null);
  const [showPropostaDetail, setShowPropostaDetail] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [propostaHistory, setPropostaHistory] = useState({});
  const [formData, setFormData] = useState({
    valor: '',
    prazo_entrega: '',
    certificacoes: '',
    referencias_clientes: ''
  });

  useEffect(() => {
    fetchDemandas();
    fetchPropostas();
  }, []);

  const fetchDemandas = async () => {
    try {
      const response = await fetch("/api/demandas");
      if (response.ok) {
        const data = await response.json();
        setDemandas(data.filter(d => d.status === 'Cotação'));
      }
    } catch (err) {
      console.error('Erro ao buscar demandas:', err);
    }
  };

  const fetchPropostas = async () => {
    try {
      const response = await fetch('/api/propostas');
      if (response.ok) {
        const data = await response.json();
        const filteredPropostas = data.filter(p => p.fornecedor_id === user.id);
        setPropostas(filteredPropostas);

        // Fetch history for each proposal
        for (const proposta of filteredPropostas) {
          await fetchPropostaHistory(proposta.id);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar propostas:', err);
    }
  };

  const fetchPropostaHistory = async (propostaId) => {
    try {
      const response = await fetch(`/api/propostas/${propostaId}/history`);
      if (response.ok) {
        const historyData = await response.json();
        setPropostaHistory(prev => ({ ...prev, [propostaId]: historyData }));
      } else {
        console.error(`Erro ao buscar histórico da proposta ${propostaId}:`, await response.text());
      }
    } catch (err) {
      console.error(`Erro ao buscar histórico da proposta ${propostaId}:`, err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('demanda_id', selectedDemanda.id);
      formDataToSend.append('fornecedor_id', user.id);
      formDataToSend.append('valor', formData.valor);
      formDataToSend.append('prazo_entrega', formData.prazo_entrega);
      formDataToSend.append('certificacoes', formData.certificacoes);
      formDataToSend.append('referencias_clientes', formData.referencias_clientes);
      
      if (pdfFile) {
        formDataToSend.append('pdf_file', pdfFile);
      }
      const response = await fetch("/api/propostas", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Proposta enviada com sucesso!');
        setFormData({
          valor: '',
          prazo_entrega: '',
          certificacoes: '',
          referencias_clientes: ''
        });
        setPdfFile(null);
        setShowForm(false);
        setSelectedDemanda(null);
        fetchPropostas();
      } else {
        const error = await response.json();
        alert(`Erro ao enviar proposta: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error('Erro ao enviar proposta:', err);
      alert('Erro ao enviar proposta. Tente novamente.');
    }
  };

  const handleUpdateProposta = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/propostas/${selectedProposta.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          changed_by_user_id: user.id
        }),
      });

      if (response.ok) {
        alert('Proposta atualizada com sucesso!');
        setFormData({
          valor: '',
          prazo_entrega: '',
          certificacoes: '',
          referencias_clientes: ''
        });
        setShowEditForm(false);
        setShowPropostaDetail(false);
        setSelectedProposta(null);
        fetchPropostas();
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar proposta: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error('Erro ao atualizar proposta:', err);
      alert('Erro ao atualizar proposta. Tente novamente.');
    }
  };

  const handleNovaProposta = (demanda) => {
    setSelectedDemanda(demanda);
    setShowForm(true);
  };

  const handleViewProposta = (proposta) => {
    setSelectedProposta(proposta);
    setShowPropostaDetail(true);
  };

  const handleEditProposta = (proposta) => {
    setFormData({
      valor: proposta.valor,
      prazo_entrega: proposta.prazo_entrega,
      certificacoes: proposta.certificacoes || '',
      referencias_clientes: proposta.referencias_clientes || ''
    });
    setShowEditForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Condo Justo - Dashboard do Fornecedor</h1>
          <div className="flex items-center gap-4">
            <span>Olá, {user.username}</span>
            <Button onClick={onLogout} variant="secondary">Sair</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades Abertas</CardTitle>
              <CardDescription>Demandas disponíveis para cotação</CardDescription>
            </CardHeader>
            <CardContent>
              {demandas.length > 0 ? (
                <ul className="space-y-2">
                  {demandas.map((demanda) => (
                    <li key={demanda.id} className="flex justify-between items-center p-2 border rounded-md">
                      <span>{demanda.titulo}</span>
                      <Button onClick={() => handleNovaProposta(demanda)}>Adicionar Proposta</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma demanda aberta no momento.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minhas Propostas</CardTitle>
              <CardDescription>Propostas enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              {propostas.length > 0 ? (
                <ul className="space-y-2">
                  {propostas.map((proposta) => (
                    <li key={proposta.id} className="flex justify-between items-center p-2 border rounded-md">
                      <span>Proposta para Demanda #{proposta.demanda_id}</span>
                      <Button onClick={() => handleViewProposta(proposta)}>Ver Detalhes</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma proposta enviada ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {showForm && selectedDemanda && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enviar Proposta para: {selectedDemanda.titulo}</CardTitle>
              <CardDescription>Preencha os dados da sua proposta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prazo_entrega">Prazo de Entrega</Label>
                  <Input
                    id="prazo_entrega"
                    name="prazo_entrega"
                    value={formData.prazo_entrega}
                    onChange={handleInputChange}
                    placeholder="Ex: 30 dias"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="certificacoes">Certificações (opcional)</Label>
                  <textarea
                    id="certificacoes"
                    name="certificacoes"
                    value={formData.certificacoes}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2"
                    rows="3"
                    placeholder="Ex: ISO 9001, ABNT NBR 15575"
                  />
                </div>
                <div>
                  <Label htmlFor="pdf_file">Anexar PDF (opcional)</Label>
                  <Input
                    id="pdf_file"
                    name="pdf_file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  {pdfFile && (
                    <p className="text-sm text-gray-600 mt-1">Arquivo selecionado: {pdfFile.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="referencias_clientes">Referências Similares ou Escopo (opcional)</Label>
                  <textarea
                    id="referencias_clientes"
                    name="referencias_clientes"
                    value={formData.referencias_clientes}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2"
                    rows="4"
                    placeholder="Ex: Cliente XYZ - Reforma de área comum em condomínio de 100 unidades, concluída em março de 2024."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Enviar Proposta</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setSelectedDemanda(null);
                    setPdfFile(null);
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {showPropostaDetail && selectedProposta && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalhes da Proposta #{selectedProposta.id}</CardTitle>
              <CardDescription>Visualize e edite sua proposta</CardDescription>
            </CardHeader>
            <CardContent>
              {!showEditForm ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Valor</p>
                    <p className="font-semibold">R$ {selectedProposta.valor.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prazo de Entrega</p>
                    <p className="font-semibold">{selectedProposta.prazo_entrega}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Certificações</p>
                    <p className="font-semibold">{selectedProposta.certificacoes || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Referências de Clientes</p>
                    <p className="font-semibold">{selectedProposta.referencias_clientes || 'Não informado'}</p>
                  </div>
                  {selectedProposta.pdf_url && (
                    <div>
                      <p className="text-sm text-gray-500">PDF Anexado</p>
                      <a 
                        href={`${selectedProposta.pdf_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver PDF
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold">{selectedProposta.status}</p>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-2">Histórico de Atualizações</h4>
                    {propostaHistory[selectedProposta.id] && propostaHistory[selectedProposta.id].length > 0 ? (
                      <div className="space-y-2">
                        {propostaHistory[selectedProposta.id].map((entry) => (
                          <div key={entry.id} className="border-l-2 border-purple-500 pl-4 py-2">
                            <p className="text-xs text-gray-500">
                              {new Date(entry.change_timestamp).toLocaleString()}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">{entry.field_name}:</span> {entry.old_value} → {entry.new_value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma atualização registrada.</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleEditProposta(selectedProposta)}>Editar Proposta</Button>
                    <Button onClick={() => {
                      setShowPropostaDetail(false);
                      setSelectedProposta(null);
                      setPropostaHistory({});
                    }} variant="outline">Fechar</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProposta} className="space-y-4">
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      name="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prazo_entrega">Prazo de Entrega</Label>
                    <Input
                      id="prazo_entrega"
                      name="prazo_entrega"
                      value={formData.prazo_entrega}
                      onChange={handleInputChange}
                      placeholder="Ex: 30 dias"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificacoes">Certificações (opcional)</Label>
                    <textarea
                      id="certificacoes"
                      name="certificacoes"
                      value={formData.certificacoes}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2"
                      rows="3"
                      placeholder="Ex: ISO 9001, ABNT NBR 15575"
                    />
                  </div>
                  <div>
                    <Label htmlFor="referencias_clientes">Referências Similares ou Escopo (opcional)</Label>
                    <textarea
                      id="referencias_clientes"
                      name="referencias_clientes"
                      value={formData.referencias_clientes}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2"
                      rows="4"
                      placeholder="Ex: Cliente XYZ - Reforma de área comum em condomínio de 100 unidades, concluída em março de 2024."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Atualizar Proposta</Button>
                    <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>Cancelar</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default DashboardFornecedor;

