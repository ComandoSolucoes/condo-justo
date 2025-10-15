import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

function DashboardMorador({ user, onLogout }) {
  const [demandas, setDemandas] = useState([]);
  const [selectedDemanda, setSelectedDemanda] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [showDemandaDetail, setShowDemandaDetail] = useState(false);

  useEffect(() => {
    fetchDemandas();
  }, []);

  const fetchDemandas = async () => {
    try {
      const response = await fetch("/api/demandas");
      if (response.ok) {
        const data = await response.json();
        setDemandas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar demandas:', err);
    }
  };

  const fetchPropostas = async (demandaId) => {
    try {
      const response = await fetch("/api/propostas");
      if (response.ok) {
        const data = await response.json();
        setPropostas(data.filter(p => p.demanda_id === demandaId));
      }
    } catch (err) {
      console.error('Erro ao buscar propostas:', err);
    }
  };

  const handleViewDemanda = async (demanda) => {
    setSelectedDemanda(demanda);
    setShowDemandaDetail(true);
    await fetchPropostas(demanda.id);
  };

  const demandasAbertas = demandas.filter(d => d.status === 'Planejamento' || d.status === 'Cotação');
  const demandasEmAndamento = demandas.filter(d => d.status === 'Julgamento' || d.status === 'Votação');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Condo Justo - Dashboard do Morador</h1>
          <div className="flex items-center gap-4">
            <span>Olá, {user.username}</span>
            <Button onClick={onLogout} variant="secondary">Sair</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Demandas Abertas</CardTitle>
              <CardDescription>Em planejamento ou cotação</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{demandasAbertas.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demandas em Andamento</CardTitle>
              <CardDescription>Em julgamento ou votação</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{demandasEmAndamento.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Demandas</CardTitle>
              <CardDescription>Todas as demandas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{demandas.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demandas Recentes</CardTitle>
            <CardDescription>Últimas demandas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            {demandas.length === 0 ? (
              <p className="text-gray-500">Nenhuma demanda cadastrada ainda.</p>
            ) : (
              <div className="space-y-4">
                {demandas.slice(0, 5).map((demanda) => (
                  <div key={demanda.id} className="border-b pb-4">
                    <h3 className="font-semibold">{demanda.titulo}</h3>
                    <p className="text-sm text-gray-600">{demanda.descricao}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-500">Status: {demanda.status}</span>
                      <span className="text-gray-500">Prazo: {new Date(demanda.prazo_propostas).toLocaleDateString()}</span>
                    </div>
                    <Button onClick={() => handleViewDemanda(demanda)} className="mt-2" size="sm">Ver Propostas</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showDemandaDetail && selectedDemanda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Propostas para: {selectedDemanda.titulo}</CardTitle>
                <CardDescription>{selectedDemanda.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                {propostas.length === 0 ? (
                  <p className="text-gray-500">Nenhuma proposta recebida ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {propostas.map((proposta) => (
                      <div key={proposta.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Proposta #{proposta.id}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Valor:</span> R$ {proposta.valor.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Prazo:</span> {proposta.prazo_entrega}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {proposta.status}
                          </div>
                          {proposta.certificacoes && (
                            <div className="col-span-2">
                              <span className="font-medium">Certificações:</span> {proposta.certificacoes}
                            </div>
                          )}
                          {proposta.referencias_clientes && (
                            <div className="col-span-2">
                              <span className="font-medium">Referências:</span> {proposta.referencias_clientes}
                            </div>
                          )}
                          {proposta.pdf_url && (
                            <div className="col-span-2">
                              <a 
                                href={`http://localhost:5000${proposta.pdf_url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                📄 Ver PDF Anexado
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Button onClick={() => {
                    setShowDemandaDetail(false);
                    setSelectedDemanda(null);
                    setPropostas([]);
                  }}>Fechar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardMorador;

