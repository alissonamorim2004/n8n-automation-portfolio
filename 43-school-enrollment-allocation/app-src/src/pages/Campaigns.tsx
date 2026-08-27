import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Target, Megaphone, BookOpen, Trophy, Heart, Star } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  category: 'educacao' | 'esporte' | 'saude' | 'cultura';
  startDate: string;
  endDate: string;
  targetAudience: string;
  image: string;
  status: 'ativa' | 'finalizada' | 'em-breve';
  participants: number;
  goal: number;
  organizer: string;
  featured: boolean;
}

const Campaigns: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const campaigns: Campaign[] = [
    {
      id: '1',
      title: 'Leitura em Família - 2024',
      description: 'Incentive o hábito da leitura em casa com atividades diárias de 30 minutos entre pais e filhos.',
      fullDescription: 'A campanha Leitura em Família visa fortalecer os vínculos familiares através da leitura compartilhada. Durante 3 meses, as famílias participantes receberão livros adequados para cada faixa etária e um cronograma de atividades. O objetivo é criar o hábito da leitura diária e melhorar o desempenho escolar dos estudantes.',
      category: 'educacao',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      targetAudience: 'Famílias com crianças de 4 a 12 anos',
      image: 'https://images.pexels.com/photos/159844/book-address-book-learning-learn-159844.jpeg',
      status: 'ativa',
      participants: 245,
      goal: 500,
      organizer: 'SEMED Vilhena',
      featured: true
    },
    {
      id: '2',
      title: 'Jogos Escolares Municipais 2024',
      description: 'Competição esportiva entre todas as escolas municipais promovendo saúde e integração.',
      fullDescription: 'Os Jogos Escolares Municipais 2024 reunirão mais de 1000 estudantes em diversas modalidades esportivas. O evento promove a prática esportiva, trabalho em equipe e vida saudável. Além das competições, haverá palestras sobre nutrição e bem-estar.',
      category: 'esporte',
      startDate: '2024-03-15',
      endDate: '2024-05-20',
      targetAudience: 'Estudantes de 8 a 17 anos',
      image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg',
      status: 'ativa',
      participants: 1250,
      goal: 1500,
      organizer: 'SEMED Vilhena',
      featured: true
    },
    {
      id: '3',
      title: 'Alimentação Saudável na Escola',
      description: 'Programa educativo sobre nutrição e hábitos alimentares saudáveis para toda a comunidade escolar.',
      fullDescription: 'Esta campanha educativa aborda a importância da alimentação saudável no desenvolvimento infantil. Inclui workshops para pais, atividades práticas com os alunos na horta escolar e reformulação dos cardápios da merenda escolar com produtos locais e orgânicos.',
      category: 'saude',
      startDate: '2024-01-20',
      endDate: '2024-12-20',
      targetAudience: 'Toda a comunidade escolar',
      image: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg',
      status: 'ativa',
      participants: 3200,
      goal: 4000,
      organizer: 'SEMED Vilhena',
      featured: false
    },
    {
      id: '4',
      title: 'Festival de Talentos Estudantis',
      description: 'Valorização das habilidades artísticas e culturais dos estudantes da rede municipal.',
      fullDescription: 'O Festival de Talentos é uma celebração da diversidade cultural e artística dos nossos estudantes. Durante o evento, alunos apresentam suas habilidades em música, dança, teatro, artes visuais e literatura. É uma oportunidade única de reconhecimento e estímulo ao desenvolvimento artístico.',
      category: 'cultura',
      startDate: '2024-06-01',
      endDate: '2024-07-15',
      targetAudience: 'Estudantes de todas as idades',
      image: 'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg',
      status: 'em-breve',
      participants: 0,
      goal: 800,
      organizer: 'SEMED Vilhena',
      featured: true
    },
    {
      id: '5',
      title: 'Matemática Divertida',
      description: 'Projeto para desmistificar a matemática através de jogos e atividades lúdicas.',
      fullDescription: 'A campanha Matemática Divertida utiliza metodologias inovadoras para tornar o aprendizado da matemática mais atrativo. Com jogos educativos, competições amigáveis e aplicações práticas do dia a dia, buscamos melhorar o desempenho dos estudantes nesta disciplina fundamental.',
      category: 'educacao',
      startDate: '2024-01-15',
      endDate: '2024-11-30',
      targetAudience: 'Estudantes do Ensino Fundamental',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
      status: 'ativa',
      participants: 890,
      goal: 1200,
      organizer: 'SEMED Vilhena',
      featured: false
    },
    {
      id: '6',
      title: 'Sustentabilidade nas Escolas',
      description: 'Conscientização ambiental através de práticas sustentáveis no ambiente escolar.',
      fullDescription: 'Esta campanha promove a educação ambiental através de ações práticas como reciclagem, compostagem, economia de água e energia. Os estudantes aprendem sobre sustentabilidade enquanto contribuem para um planeta mais saudável.',
      category: 'educacao',
      startDate: '2023-08-01',
      endDate: '2023-12-15',
      targetAudience: 'Toda a comunidade escolar',
      image: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg',
      status: 'finalizada',
      participants: 2100,
      goal: 2000,
      organizer: 'SEMED Vilhena',
      featured: false
    }
  ];

  const getCategoryIcon = (category: string) => {
    const icons = {
      educacao: BookOpen,
      esporte: Trophy,
      saude: Heart,
      cultura: Star
    };
    const Icon = icons[category as keyof typeof icons] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      educacao: 'bg-blue-100 text-blue-800',
      esporte: 'bg-orange-100 text-orange-800',
      saude: 'bg-green-100 text-green-800',
      cultura: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ativa: 'bg-green-100 text-green-800',
      finalizada: 'bg-gray-100 text-gray-800',
      'em-breve': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ativa: 'Em Andamento',
      finalizada: 'Finalizada',
      'em-breve': 'Em Breve'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredCampaigns = selectedCategory === 'all' 
    ? campaigns 
    : campaigns.filter(campaign => campaign.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar ao Portal
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-accent-600 p-2 rounded-lg">
                <Megaphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campanhas Educacionais</h1>
                <p className="text-sm text-gray-600">Iniciativas para fortalecer a educação em Vilhena</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-accent-600 to-primary-600 rounded-xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Juntos por uma Educação Melhor</h2>
            <p className="text-xl opacity-90 mb-6">
              Participe das nossas campanhas e ajude a construir um futuro mais brilhante para 
              as crianças e jovens de Vilhena. Cada ação conta!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm opacity-90">Campanhas Ativas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">8.5k</div>
                <div className="text-sm opacity-90">Participantes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">28</div>
                <div className="text-sm opacity-90">Escolas Envolvidas</div>
              </div>
              <div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm opacity-90">Taxa de Sucesso</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas as Campanhas
            </button>
            <button
              onClick={() => setSelectedCategory('educacao')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'educacao'
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Educação
            </button>
            <button
              onClick={() => setSelectedCategory('esporte')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'esporte'
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Esporte
            </button>
            <button
              onClick={() => setSelectedCategory('saude')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'saude'
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Saúde
            </button>
            <button
              onClick={() => setSelectedCategory('cultura')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'cultura'
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cultura
            </button>
          </div>
        </div>

        {/* Featured Campaigns */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Campanhas em Destaque</h3>
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredCampaigns.filter(campaign => campaign.featured).map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(campaign.category)}`}>
                        {getCategoryIcon(campaign.category)}
                        <span className="ml-1 capitalize">{campaign.category}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                  
                  {campaign.status === 'ativa' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Participantes</span>
                        <span>{campaign.participants} / {campaign.goal}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-accent-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((campaign.participants / campaign.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(campaign.startDate).toLocaleDateString('pt-BR')} - {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {campaign.targetAudience}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="w-full bg-accent-600 hover:bg-accent-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Campaigns */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Todas as Campanhas</h3>
          <div className="space-y-4">
            {filteredCampaigns.filter(campaign => !campaign.featured).map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex gap-6">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(campaign.category)}`}>
                          {getCategoryIcon(campaign.category)}
                          <span className="ml-1 capitalize">{campaign.category}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                    
                    {campaign.status === 'ativa' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Participantes: {campaign.participants} / {campaign.goal}</span>
                          <span>{Math.round((campaign.participants / campaign.goal) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-accent-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((campaign.participants / campaign.goal) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="mr-4">
                        {new Date(campaign.startDate).toLocaleDateString('pt-BR')} - {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                      </span>
                      <Users className="h-3 w-3 mr-1" />
                      <span>{campaign.targetAudience}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Detail Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img 
                  src={selectedCampaign.image} 
                  alt={selectedCampaign.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedCampaign.category)}`}>
                    {getCategoryIcon(selectedCampaign.category)}
                    <span className="ml-1 capitalize">{selectedCampaign.category}</span>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                    {getStatusLabel(selectedCampaign.status)}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedCampaign.title}</h2>
                <p className="text-gray-600 mb-6">{selectedCampaign.fullDescription}</p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Informações</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(selectedCampaign.startDate).toLocaleDateString('pt-BR')} - {new Date(selectedCampaign.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{selectedCampaign.targetAudience}</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        <span>Organizado por {selectedCampaign.organizer}</span>
                      </div>
                    </div>
                  </div>

                  {selectedCampaign.status === 'ativa' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Progresso</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Participantes</span>
                          <span>{selectedCampaign.participants} / {selectedCampaign.goal}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-accent-600 h-3 rounded-full" 
                            style={{ width: `${Math.min((selectedCampaign.participants / selectedCampaign.goal) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {Math.round((selectedCampaign.participants / selectedCampaign.goal) * 100)}% da meta alcançada
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedCampaign.status === 'ativa' && (
                  <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                    <h4 className="font-semibold text-accent-900 mb-2">Como Participar</h4>
                    <p className="text-sm text-accent-800 mb-3">
                      Entre em contato com a escola do seu filho ou diretamente com a SEMED para se inscrever nesta campanha.
                    </p>
                    <div className="flex space-x-3">
                      <button className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Quero Participar
                      </button>
                      <button className="bg-white hover:bg-gray-50 text-accent-600 border border-accent-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Mais Informações
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;