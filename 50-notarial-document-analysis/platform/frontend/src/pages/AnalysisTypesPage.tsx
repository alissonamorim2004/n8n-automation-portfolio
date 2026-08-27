import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
import { analysisTypesApi } from '../lib/api';
import { useToast } from '../components/ui/toast';

interface AnalysisType {
  id: string;
  name: string;
  description: string;
  aiModel: string;
  template: string;
  isActive: boolean;
}

const MOCK_MODE = true;

const mockTypes: AnalysisType[] = [
  {
    id: '2',
    name: 'Análise de Contrato',
    description: 'Análise detalhada de contratos e cláusulas contratuais',
    aiModel: 'medium',
    template: 'Analise o contrato fornecido e identifique pontos críticos, riscos e oportunidades...',
    isActive: true,
  },
  {
    id: '3',
    name: 'Due Diligence',
    description: 'Revisão completa de documentos para due diligence',
    aiModel: 'high',
    template: 'Realize uma análise de due diligence completa identificando riscos e conformidades...',
    isActive: true,
  },
  {
    id: '4',
    name: 'Análise de Escritura',
    description: 'Análise técnica de escrituras públicas',
    aiModel: 'medium',
    template: 'Analise a escritura pública identificando partes, objeto e cláusulas essenciais...',
    isActive: true,
  },
];

export default function AnalysisTypesPage() {
  const { showToast } = useToast();
  const [types, setTypes] = useState<AnalysisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    aiModel: 'medium',
    template: '',
    isActive: true,
  });

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    setLoading(true);
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setTypes(mockTypes);
      } else {
        const response = await analysisTypesApi.getAll();
        if (response.data) {
          setTypes(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading analysis types:', error);
      showToast('error', 'Erro ao carregar', 'Não foi possível carregar os tipos de análise');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type?: AnalysisType) => {
    if (type) {
      setEditingId(type.id);
      setForm({
        name: type.name,
        description: type.description,
        aiModel: type.aiModel,
        template: type.template,
        isActive: type.isActive,
      });
    } else {
      setEditingId(null);
      setForm({
        name: '',
        description: '',
        aiModel: 'medium',
        template: '',
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const response = await analysisTypesApi.update(editingId, form);
        if (response.error) {
          showToast('error', 'Erro ao editar', response.error);
          return;
        }
        showToast('success', 'Tipo atualizado!', 'As alterações foram salvas com sucesso');
      } else {
        const response = await analysisTypesApi.create(form);
        if (response.error) {
          showToast('error', 'Erro ao criar', response.error);
          return;
        }
        showToast('success', 'Tipo criado!', `${form.name} foi adicionado com sucesso`);
      }

      setShowDialog(false);
      loadTypes();
    } catch (error) {
      console.error('Error saving analysis type:', error);
      showToast('error', 'Erro inesperado', 'Ocorreu um erro ao processar a solicitação');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de análise?')) {
      return;
    }

    try {
      const response = await analysisTypesApi.delete(id);
      if (response.error) {
        showToast('error', 'Erro ao excluir', response.error);
        return;
      }
      showToast('success', 'Tipo excluído!', 'O tipo de análise foi removido com sucesso');
      loadTypes();
    } catch (error) {
      console.error('Error deleting analysis type:', error);
      showToast('error', 'Erro ao excluir', 'Não foi possível excluir o tipo de análise');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tipos de Análise
          </h2>
          <p className="text-muted-foreground mt-1">Gerencie os tipos de análises disponíveis</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-5 h-5 mr-2" />
          Novo Tipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {types.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Nível: {type.aiModel === 'low' ? 'Baixo' : type.aiModel === 'medium' ? 'Médio' : 'Alto'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(type)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(type.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{type.description}</p>

              {/* Campo de ID copiável */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-700 mb-1.5">🆔 ID da Análise:</p>
                    <code className="text-sm font-mono text-slate-800 bg-white px-2 py-1 rounded border border-blue-300 select-all block">
                      {type.id}
                    </code>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(type.id);
                      showToast('ID copiado para a área de transferência!', 'success');
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1.5 shadow-md"
                    title="Copiar ID"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Use este ID para configurar webhooks e integrações externas
                </p>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-medium mb-1">Template:</p>
                <p className="text-xs text-muted-foreground line-clamp-3">{type.template}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogClose onClick={() => setShowDialog(false)} />
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Tipo de Análise' : 'Novo Tipo de Análise'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes do tipo de análise e o modelo de IA
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome da Análise</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Análise de Contrato"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva o objetivo desta análise"
                  required
                />
              </div>

              <div>
                <Label htmlFor="aiModel">Nível de Processamento</Label>
                <select
                  id="aiModel"
                  value={form.aiModel}
                  onChange={(e) => setForm({ ...form, aiModel: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="low">Baixo (Low)</option>
                  <option value="medium">Médio (Medium)</option>
                  <option value="high">Alto (High)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Escolha o nível de processamento de acordo com a complexidade da análise
                </p>
              </div>

              <div>
                <Label htmlFor="template">Template de Prompt</Label>
                <Textarea
                  id="template"
                  value={form.template}
                  onChange={(e) => setForm({ ...form, template: e.target.value })}
                  placeholder="Digite o template que será enviado para a IA..."
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Este template será usado para guiar a análise da IA
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? 'Salvar Alterações' : 'Criar Tipo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
