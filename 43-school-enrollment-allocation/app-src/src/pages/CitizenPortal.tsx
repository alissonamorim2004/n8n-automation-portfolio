import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Users, FileText, ArrowLeft, Filter, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProximityMap from '../components/ProximityMap';

interface School {
  id: string;
  name: string;
  district: string;
  address: string;
  distance: number;
  levels: string[];
  availableVacancies: {
    level: string;
    class: string;
    vacancies: number;
    waitingList: number;
  }[];
  images: string[];
  description: string;
}

const CitizenPortal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showMap, setShowMap] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const schools: School[] = [
    {
      id: '1',
      name: 'Escola Municipal Centro',
      district: 'Centro',
      address: 'Av. Capitão Castro, 1250',
      distance: 0.8,
      levels: ['Fundamental I', 'Fundamental II'],
      images: ['https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg'],
      description: 'Escola municipal com tradição em educação de qualidade no centro da cidade.',
      availableVacancies: [
        { level: 'Fundamental I', class: '2º Ano A', vacancies: 3, waitingList: 5 },
        { level: 'Fundamental I', class: '3º Ano B', vacancies: 1, waitingList: 12 },
      ]
    },
    {
      id: '2',
      name: 'Escola Municipal Vila Nova',
      district: 'Vila Nova',
      address: 'Rua das Palmeiras, 456',
      distance: 1.2,
      levels: ['Fundamental I', 'Fundamental II', 'Ensino Médio'],
      images: ['https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg'],
      description: 'Escola com foco na formação integral do aluno, oferecendo ensino completo.',
      availableVacancies: [
        { level: 'Fundamental I', class: '1º Ano C', vacancies: 0, waitingList: 8 },
        { level: 'Ensino Médio', class: '1º Médio A', vacancies: 2, waitingList: 22 },
      ]
    },
    {
      id: '3',
      name: 'EMEI Jardim Eldorado',
      district: 'Jardim Eldorado',
      address: 'Rua dos Girassóis, 789',
      distance: 2.1,
      levels: ['Educação Infantil'],
      images: ['https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg'],
      description: 'Educação infantil com metodologia lúdica e ambiente acolhedor.',
      availableVacancies: [
        { level: 'Educação Infantil', class: 'Jardim I A', vacancies: 5, waitingList: 3 },
        { level: 'Educação Infantil', class: 'Jardim II B', vacancies: 2, waitingList: 8 },
      ]
    },
  ];

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || school.levels.some(level => 
      level.toLowerCase().includes(selectedLevel.toLowerCase())
    );
    const matchesDistrict = selectedDistrict === 'all' || school.district === selectedDistrict;
    
    return matchesSearch && matchesLevel && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portal do Cidadão</h1>
                  <p className="text-sm text-gray-600">Bem-vindo, {user?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/status/123" 
                className="flex items-center px-3 py-2 bg-secondary-600 text-white rounded-lg text-sm font-medium hover:bg-secondary-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Minhas Matrículas
              </Link>
              <div className="flex items-center space-x-2">
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Encontre a escola ideal para seu filho</h2>
            <p className="text-xl opacity-90 mb-6">
              Consulte vagas disponíveis, faça sua matrícula na lista de espera e acompanhe o processo em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/matricula" 
                className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-5 w-5 mr-2" />
                Nova Matrícula
              </Link>
              <button
                onClick={() => setShowMap(!showMap)}
                className="inline-flex items-center bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                <MapPin className="h-5 w-5 mr-2" />
                {showMap ? 'Ocultar Mapa' : 'Ver Mapa de Proximidade'}
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Summary */}
        {user?.profile && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Perfil</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Endereço</p>
                <p className="font-medium text-gray-900">{(user.profile as any).address}</p>
                <p className="text-gray-500">{(user.profile as any).district}</p>
              </div>
              <div>
                <p className="text-gray-600">Filhos Cadastrados</p>
                <p className="font-medium text-gray-900">{(user.profile as any).children?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <div className="flex items-center">
                  {(user.profile as any).hasBolsaFamilia && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded-full">
                      Prioridade Social
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proximity Map */}
        {showMap && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mapa de Proximidade - Escolas Próximas</h3>
              <p className="text-sm text-gray-600">
                Baseado na sua localização: {(user?.profile as any)?.district || 'Centro'}
              </p>
            </div>
            <ProximityMap userDistrict={(user?.profile as any)?.district} className="w-full h-96" />
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Como funciona o Sistema de Alocação Inteligente:</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium">1. Prioridade Social</p>
                  <p className="text-blue-700">Famílias do Bolsa Família têm prioridade</p>
                </div>
                <div>
                  <p className="font-medium">2. Proximidade Geográfica</p>
                  <p className="text-blue-700">Escolas mais próximas da sua residência</p>
                </div>
                <div>
                  <p className="font-medium">3. Ordem Cronológica</p>
                  <p className="text-blue-700">Data de solicitação da matrícula</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar escola por nome ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos os Níveis</option>
                <option value="infantil">Educação Infantil</option>
                <option value="fundamental">Ensino Fundamental</option>
                <option value="medio">Ensino Médio</option>
              </select>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos os Bairros</option>
                <option value="Centro">Centro</option>
                <option value="Vila Nova">Vila Nova</option>
                <option value="Jardim Eldorado">Jardim Eldorado</option>
                <option value="Residencial Oliveira">Residencial Oliveira</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredSchools.length} escola(s) encontrada(s)
            </h3>
            <p className="text-sm text-gray-600">
              Ordenado por proximidade
            </p>
          </div>

          {filteredSchools.map((school) => (
            <div key={school.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* School Image */}
                <div className="lg:w-48 h-32 lg:h-auto">
                  <img 
                    src={school.images[0]} 
                    alt={school.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                {/* School Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{school.name}</h4>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{school.address} • {school.distance} km de distância</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{school.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {school.levels.map((level, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {school.availableVacancies.map((vacancy, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-900">{vacancy.class}</h5>
                          {vacancy.vacancies > 0 ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {vacancy.vacancies} vagas
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Lotada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{vacancy.level}</p>
                        {vacancy.waitingList > 0 && (
                          <p className="text-xs text-yellow-600 mt-1">
                            {vacancy.waitingList} na lista de espera
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Critérios de seleção:</span> Prioridade social → Proximidade → Ordem de matrícula
                    </div>
                    <Link 
                      to="/matricula" 
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Fazer Matrícula
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Precisa de Ajuda?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-2">Como funciona a alocação?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Prioridade para famílias do Bolsa Família</li>
                <li>• Proximidade geográfica (menor distância)</li>
                <li>• Ordem cronológica de matrícula</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Contato SEMED</p>
              <p className="text-blue-700">📞 (69) 3321-4567</p>
              <p className="text-blue-700">📧 semed@vilhena.ro.gov.br</p>
              <p className="text-blue-700">🕒 Segunda a Sexta, 7h às 17h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenPortal;