import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Users, School, BarChart3, ArrowLeft, Filter, Download, LogOut, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../contexts/AuthContext';

const SemedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'reports' | 'simulation' | 'demographics'>('overview');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const occupancyData = [
    { month: 'Jan', ocupadas: 1250, capacidade: 1500 },
    { month: 'Fev', ocupadas: 1280, capacidade: 1500 },
    { month: 'Mar', ocupadas: 1320, capacidade: 1500 },
    { month: 'Abr', ocupadas: 1350, capacidade: 1500 },
    { month: 'Mai', ocupadas: 1380, capacidade: 1500 },
    { month: 'Jun', ocupadas: 1420, capacidade: 1500 },
  ];

  const demandData = [
    { name: 'Jardim I', demanda: 120, vagas: 80, fila: 40 },
    { name: 'Jardim II', demanda: 110, vagas: 85, fila: 25 },
    { name: '1º Ano', demanda: 200, vagas: 150, fila: 50 },
    { name: '2º Ano', demanda: 180, vagas: 160, fila: 20 },
    { name: '6º Ano', demanda: 220, vagas: 180, fila: 40 },
    { name: '1º Médio', demanda: 250, vagas: 200, fila: 50 },
  ];

  const districtData = [
    { name: 'Centro', value: 25, color: '#3B82F6', population: 1250, children: 320 },
    { name: 'Jardim Eldorado', value: 20, color: '#059669', population: 980, children: 280 },
    { name: 'Vila Nova', value: 18, color: '#EA580C', population: 850, children: 240 },
    { name: 'Residencial Oliveira', value: 15, color: '#8B5CF6', population: 720, children: 180 },
    { name: 'Outros', value: 22, color: '#6B7280', population: 1200, children: 300 },
  ];

  const schoolStats = [
    { name: 'E.M. Centro', capacity: 300, occupied: 285, waiting: 45, efficiency: 95, district: 'Centro' },
    { name: 'E.M. Vila Nova', capacity: 250, occupied: 230, waiting: 32, efficiency: 92, district: 'Vila Nova' },
    { name: 'E.M. Jardim Eldorado', capacity: 280, occupied: 250, waiting: 28, efficiency: 89, district: 'Jardim Eldorado' },
    { name: 'E.M. Oliveira', capacity: 200, occupied: 175, waiting: 15, efficiency: 88, district: 'Residencial Oliveira' },
  ];

  // Mock demographic data
  const demographicData = {
    totalFamilies: 1250,
    totalChildren: 1320,
    bolsaFamiliaFamilies: 380,
    averageIncome: 2850,
    specialNeedsChildren: 45,
    byDistrict: districtData.map(d => ({
      ...d,
      families: Math.floor(d.population / 3.2),
      averageIncome: 2000 + Math.random() * 2000,
      bolsaFamilia: Math.floor(d.children * 0.3)
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-accent-600 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SEMED Dashboard</h1>
                  <p className="text-sm text-gray-600">Painel Estratégico - Vilhena</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </button>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Secretário de Educação</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <School className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Escolas</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
                <p className="text-xs text-green-600">+2 desde jan/24</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alunos Matriculados</p>
                <p className="text-2xl font-bold text-gray-900">4.325</p>
                <p className="text-xs text-green-600">+3.2% vs ano anterior</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-gray-900">87.3%</p>
                <p className="text-xs text-yellow-600">Próximo ao limite</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lista de Espera</p>
                <p className="text-2xl font-bold text-gray-900">312</p>
                <p className="text-xs text-red-600">+15% este mês</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('demographics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'demographics'
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Demografia
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'map'
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mapa Interativo
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Relatórios
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'simulation'
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Simulação
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução da Ocupação</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={occupancyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="ocupadas" stroke="#059669" strokeWidth={2} />
                        <Line type="monotone" dataKey="capacidade" stroke="#6B7280" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Demanda por Nível</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={demandData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="vagas" fill="#3B82F6" />
                        <Bar dataKey="fila" fill="#EA580C" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Schools Performance Table */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance das Escolas</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escola</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bairro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupação</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fila de Espera</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eficiência</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {schoolStats.map((school, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.district}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.capacity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.occupied}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.waiting}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                school.efficiency >= 90 ? 'bg-green-100 text-green-800' : 
                                school.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {school.efficiency}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'demographics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Análise Demográfica da Cidade</h3>
                
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900">Total de Famílias</h4>
                    <p className="text-2xl font-bold text-blue-600">{demographicData.totalFamilies.toLocaleString()}</p>
                    <p className="text-sm text-blue-700">Cadastradas no sistema</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900">Crianças (0-17 anos)</h4>
                    <p className="text-2xl font-bold text-green-600">{demographicData.totalChildren.toLocaleString()}</p>
                    <p className="text-sm text-green-700">Em idade escolar</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900">Bolsa Família</h4>
                    <p className="text-2xl font-bold text-red-600">{demographicData.bolsaFamiliaFamilies}</p>
                    <p className="text-sm text-red-700">{Math.round((demographicData.bolsaFamiliaFamilies / demographicData.totalFamilies) * 100)}% das famílias</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900">Renda Média</h4>
                    <p className="text-2xl font-bold text-purple-600">R$ {demographicData.averageIncome.toLocaleString()}</p>
                    <p className="text-sm text-purple-700">Por família</p>
                  </div>
                </div>

                {/* District Demographics */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Demografia por Bairro</h4>
                    <div className="space-y-3">
                      {demographicData.byDistrict.map((district, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-gray-900">{district.name}</h5>
                            <span className="text-sm text-gray-600">{district.children} crianças</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="block font-medium">Famílias</span>
                              <span>{district.families}</span>
                            </div>
                            <div>
                              <span className="block font-medium">Renda Média</span>
                              <span>R$ {Math.round(district.averageIncome).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="block font-medium">Bolsa Família</span>
                              <span>{district.bolsaFamilia}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Distribuição Populacional</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={districtData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="children"
                          label={({ name, children }) => `${name}: ${children}`}
                        >
                          {districtData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Insights Demográficos</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <p className="font-medium mb-2">Regiões de Alta Demanda:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Centro: Maior concentração populacional</li>
                        <li>• Jardim Eldorado: Crescimento acelerado</li>
                        <li>• Vila Nova: Demanda estável</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Recomendações:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Considerar nova unidade no Jardim Eldorado</li>
                        <li>• Ampliar capacidade no Centro</li>
                        <li>• Monitorar crescimento em outros bairros</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-6">
                {/* Map Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filtros:</span>
                  </div>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todos os Níveis</option>
                    <option value="infantil">Educação Infantil</option>
                    <option value="fundamental1">Fundamental I</option>
                    <option value="fundamental2">Fundamental II</option>
                    <option value="medio">Ensino Médio</option>
                  </select>
                  <select 
                    value={selectedDistrict} 
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todos os Distritos</option>
                    <option value="centro">Centro</option>
                    <option value="jardim">Jardim Eldorado</option>
                    <option value="vila">Vila Nova</option>
                    <option value="oliveira">Residencial Oliveira</option>
                  </select>
                </div>

                {/* Map and Legend */}
                <div className="grid lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapa de Vilhena - Escolas e Demografia</h3>
                    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapComponent />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Legenda</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span>Capacidade adequada</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                          <span>Próximo ao limite</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span>Sobrecarga</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Distribuição por Distrito</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={districtData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {districtData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Relatório de Ocupação</h4>
                    <p className="text-sm text-gray-600 mb-4">Análise detalhada da ocupação por escola e período</p>
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
                      Gerar Relatório
                    </button>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Previsão de Demanda</h4>
                    <p className="text-sm text-gray-600 mb-4">Projeções para os próximos 6 meses baseadas em histórico</p>
                    <button className="w-full bg-secondary-600 hover:bg-secondary-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
                      Ver Projeções
                    </button>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Análise Demográfica</h4>
                    <p className="text-sm text-gray-600 mb-4">Distribuição populacional e necessidades por região</p>
                    <button className="w-full bg-accent-600 hover:bg-accent-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
                      Visualizar Dados
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'simulation' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulador de Abertura de Turmas</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Escola</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>E.M. Centro</option>
                          <option>E.M. Vila Nova</option>
                          <option>E.M. Jardim Eldorado</option>
                          <option>E.M. Oliveira</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Ensino</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                          <option>1º Ano - Fundamental I</option>
                          <option>2º Ano - Fundamental I</option>
                          <option>6º Ano - Fundamental II</option>
                          <option>1º Ano - Ensino Médio</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número de Vagas</label>
                        <input type="number" defaultValue="25" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                      </div>
                      <button className="w-full bg-accent-600 hover:bg-accent-700 text-white py-2 px-4 rounded-lg font-medium">
                        Simular Impacto
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Resultado da Simulação</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Fila atual:</span>
                          <span className="font-medium">45 alunos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vagas adicionais:</span>
                          <span className="font-medium text-green-600">+25</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nova fila:</span>
                          <span className="font-medium">20 alunos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Redução:</span>
                          <span className="font-medium text-green-600">55.6%</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Impacto:</strong> 25 famílias serão beneficiadas imediatamente. 
                          Tempo estimado de redução da fila: 3 meses.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemedDashboard;