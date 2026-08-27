import { useState, useEffect, useRef } from 'react';
import { Loader2, TrendingUp, Users, FileText, DollarSign, Zap, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { tokenUsageApi } from '../lib/api';

const MOCK_MODE = true;

const mockStats = {
  totalTokens: 487523,
  totalCost: 1847.25,
  totalDocuments: 234,
  totalUsers: 8,
  byUser: [
    { user_id: '1', full_name: 'João Silva', email: 'joao@plataforma.com.br', tokens_used: 125480, cost: 475.20 },
    { user_id: '2', full_name: 'Maria Santos', email: 'maria@plataforma.com.br', tokens_used: 98750, cost: 374.15 },
    { user_id: '3', full_name: 'Pedro Costa', email: 'pedro@plataforma.com.br', tokens_used: 87340, cost: 330.87 },
    { user_id: '4', full_name: 'Ana Oliveira', email: 'ana@plataforma.com.br', tokens_used: 64523, cost: 244.38 },
    { user_id: '5', full_name: 'Carlos Mendes', email: 'carlos@plataforma.com.br', tokens_used: 56780, cost: 215.05 },
  ],
  byAnalysisType: [
    { analysis_type_id: '2', name: 'Análise de Contrato', usage_count: 67, tokens_used: 145230, cost: 550.37 },
    { analysis_type_id: '3', name: 'Due Diligence', usage_count: 42, tokens_used: 87490, cost: 331.36 },
    { analysis_type_id: '4', name: 'Análise de Escritura', usage_count: 36, tokens_used: 56053, cost: 212.60 },
  ],
};

export default function TokenUsagePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadStats(true);
      }, 30000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, dateRange]);

  const loadStats = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats(mockStats);
        setLastUpdate(new Date());
      } else {
        const response = await tokenUsageApi.getStats(dateRange);
        if (response.data) {
          setStats(response.data);
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error('Error loading token usage stats:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num);
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const formatLastUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
    return lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Uso de Tokens</h2>
          <p className="text-muted-foreground mt-1">Monitore o consumo de tokens e custos em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{formatLastUpdate()}</span>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
              autoRefresh
                ? 'bg-primary text-white border-primary'
                : 'bg-card border-border hover:bg-muted'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={() => loadStats()}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-all"
            title="Atualizar agora"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-border rounded-lg bg-card focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="all">Todo período</option>
          </select>
        </div>
      </div>

      {!stats && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Total de Tokens</CardDescription>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(stats?.totalTokens || 0)}</div>
                <p className="text-xs text-muted-foreground mt-2">Tokens consumidos</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Custo Total</CardDescription>
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-secondary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(stats?.totalCost || 0)}</div>
                <p className="text-xs text-muted-foreground mt-2">Custo estimado</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Documentos</CardDescription>
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(stats?.totalDocuments || 0)}</div>
                <p className="text-xs text-muted-foreground mt-2">Processados</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>Usuários Ativos</CardDescription>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Com atividade</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats?.byUser && stats.byUser.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Uso por Usuário
                  </CardTitle>
                  <CardDescription>Top usuários por consumo de tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byUser.map((user: any, index: number) => (
                      <div key={user.user_id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatNumber(user.tokens_used)}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(user.cost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {stats?.byAnalysisType && stats.byAnalysisType.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-secondary" />
                    Uso por Tipo de Análise
                  </CardTitle>
                  <CardDescription>Distribuição por categoria de análise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byAnalysisType.map((type: any) => (
                      <div key={type.analysis_type_id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-xs text-muted-foreground">{type.usage_count} análises realizadas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-secondary">{formatNumber(type.tokens_used)}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(type.cost)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
