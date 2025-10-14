import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

function DashboardMorador({ user, onLogout }) {
  const [demandas, setDemandas] = useState([]);

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
        <Card>
          <CardHeader>
            <CardTitle>Demandas do Condomínio</CardTitle>
            <CardDescription>Acompanhe os processos de compras</CardDescription>
          </CardHeader>
          <CardContent>
            {demandas.length === 0 ? (
              <p className="text-gray-500">Nenhuma demanda cadastrada ainda.</p>
            ) : (
              <div className="space-y-4">
                {demandas.map((demanda) => (
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

export default DashboardMorador;

