import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';

function DashboardSindico({ user, onLogout }) {
  const [demandas, setDemandas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    criterios_julgamento: '',
    prazo_propostas: ''
  });

  useEffect(() => {
    fetchDemandas();
  }, []);

  const fetchDemandas = async () => {
    try {
      const response = await fetch('/api/demandas');
      if (response.ok) {
        const data = await response.json();
        setDemandas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar demandas:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/demandas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          condominio_id: user.id
        }),
      });

      if (response.ok) {
        alert('Demanda criada com sucesso!');
        setFormData({
          titulo: '',
          descricao: '',
          criterios_julgamento: '',
          prazo_propostas: ''
        });
        setShowForm(false);
        fetchDemandas();
      } else {
        const error = await response.json();
        alert(`Erro ao criar demanda: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error('Erro ao criar demanda:', err);
      alert('Erro ao criar demanda. Tente novamente.');
    }
  };

  const demandasAbertas = demandas.filter(d => d.status === 'Planejamento' || d.status === 'Cotação');
  const demandasEmAndamento = demandas.filter(d => d.status === 'Julgamento' || d.status === 'Votação');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Condo Justo - Dashboard do Síndico</h1>
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

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nova Demanda'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Criar Nova Demanda</CardTitle>
              <CardDescription>Preencha os dados da demanda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-md p-2"
                    rows="4"
                  />
                </div>
                <div>
                  <Label htmlFor="criterios_julgamento">Critérios de Julgamento</Label>
                  <Input
                    id="criterios_julgamento"
                    name="criterios_julgamento"
                    value={formData.criterios_julgamento}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prazo_propostas">Prazo para Propostas</Label>
                  <Input
                    id="prazo_propostas"
                    name="prazo_propostas"
                    type="datetime-local"
                    value={formData.prazo_propostas}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit">Criar Demanda</Button>
              </form>
            </CardContent>
          </Card>
        )}

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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default DashboardSindico;

