import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Eye, Heart, Share2, Award, BookOpen, Users, Trophy } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  school: string;
  date: string;
  category: 'evento' | 'conquista' | 'projeto' | 'historia';
  image: string;
  views: number;
  likes: number;
  featured: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  school: string;
  category: 'academico' | 'esportivo' | 'cultural' | 'social';
  image: string;
}

const CultureBlog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blog' | 'achievements' | 'history'>('blog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Festival de Talentos 2024 - E.M. Vila Nova',
      excerpt: 'Alunos demonstram suas habilidades artísticas em apresentação emocionante que reuniu toda a comunidade escolar.',
      content: 'O Festival de Talentos da E.M. Vila Nova foi um sucesso absoluto...',
      author: 'Profª. Maria Fernanda',
      school: 'E.M. Vila Nova',
      date: '2024-01-20',
      category: 'evento',
      image: 'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg',
      views: 245,
      likes: 32,
      featured: true
    },
    {
      id: '2',
      title: 'Projeto Horta Escolar Transforma Alimentação',
      excerpt: 'Iniciativa da EMEI Jardim Eldorado ensina sustentabilidade e melhora a merenda escolar com produtos orgânicos.',
      content: 'A horta escolar da EMEI Jardim Eldorado tem sido um exemplo...',
      author: 'Coord. Ana Paula',
      school: 'EMEI Jardim Eldorado',
      date: '2024-01-18',
      category: 'projeto',
      image: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg',
      views: 189,
      likes: 28,
      featured: false
    },
    {
      id: '3',
      title: 'Alunos da E.M. Centro Conquistam 1º Lugar na Olimpíada de Matemática',
      excerpt: 'Equipe de estudantes do 9º ano se destaca em competição estadual, trazendo orgulho para Vilhena.',
      content: 'A dedicação e o empenho dos alunos da E.M. Centro...',
      author: 'Prof. Carlos Silva',
      school: 'E.M. Centro',
      date: '2024-01-15',
      category: 'conquista',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
      views: 312,
      likes: 45,
      featured: true
    },
    {
      id: '4',
      title: 'História da Educação em Vilhena: 50 Anos de Transformação',
      excerpt: 'Conheça a trajetória da educação municipal desde a fundação da cidade até os dias atuais.',
      content: 'A educação em Vilhena começou de forma humilde...',
      author: 'Secretaria de Educação',
      school: 'SEMED',
      date: '2024-01-10',
      category: 'historia',
      image: 'https://images.pexels.com/photos/159844/book-address-book-learning-learn-159844.jpeg',
      views: 156,
      likes: 22,
      featured: false
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Medalha de Ouro - OBMEP 2023',
      description: 'Estudante João Silva conquista medalha de ouro na Olimpíada Brasileira de Matemática das Escolas Públicas',
      year: '2023',
      school: 'E.M. Centro',
      category: 'academico',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg'
    },
    {
      id: '2',
      title: 'Campeão Regional de Futsal',
      description: 'Equipe masculina de futsal da E.M. Vila Nova conquista o título regional dos Jogos Escolares',
      year: '2023',
      school: 'E.M. Vila Nova',
      category: 'esportivo',
      image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg'
    },
    {
      id: '3',
      title: 'Projeto Sustentável Premiado',
      description: 'Iniciativa de reciclagem da EMEI Jardim Eldorado recebe prêmio estadual de sustentabilidade',
      year: '2023',
      school: 'EMEI Jardim Eldorado',
      category: 'social',
      image: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg'
    },
    {
      id: '4',
      title: 'Festival de Arte e Cultura',
      description: 'E.M. Oliveira organiza festival que reúne mais de 500 pessoas da comunidade',
      year: '2023',
      school: 'E.M. Oliveira',
      category: 'cultural',
      image: 'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg'
    }
  ];

  const getCategoryIcon = (category: string) => {
    const icons = {
      evento: Calendar,
      conquista: Trophy,
      projeto: BookOpen,
      historia: Award,
      academico: BookOpen,
      esportivo: Trophy,
      cultural: Users,
      social: Heart
    };
    const Icon = icons[category as keyof typeof icons] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      evento: 'bg-blue-100 text-blue-800',
      conquista: 'bg-yellow-100 text-yellow-800',
      projeto: 'bg-green-100 text-green-800',
      historia: 'bg-purple-100 text-purple-800',
      academico: 'bg-blue-100 text-blue-800',
      esportivo: 'bg-orange-100 text-orange-800',
      cultural: 'bg-pink-100 text-pink-800',
      social: 'bg-green-100 text-green-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

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
              <div className="bg-secondary-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cultura & Educação</h1>
                <p className="text-sm text-gray-600">Histórias, conquistas e eventos de Vilhena</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Celebrando a Educação de Vilhena</h2>
            <p className="text-xl opacity-90 mb-6">
              Acompanhe as conquistas, projetos inovadores e a rica história educacional da nossa cidade.
              Cada escola tem sua história, cada aluno tem seu potencial.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">28</div>
                <div className="text-sm opacity-90">Escolas Municipais</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.325</div>
                <div className="text-sm opacity-90">Alunos Atendidos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm opacity-90">Anos de História</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('blog')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blog'
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Blog & Notícias
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'achievements'
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Conquistas & Prêmios
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                História da Educação
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'blog' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-secondary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas as Categorias
                  </button>
                  <button
                    onClick={() => setSelectedCategory('evento')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'evento'
                        ? 'bg-secondary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Eventos
                  </button>
                  <button
                    onClick={() => setSelectedCategory('projeto')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'projeto'
                        ? 'bg-secondary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Projetos
                  </button>
                  <button
                    onClick={() => setSelectedCategory('conquista')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'conquista'
                        ? 'bg-secondary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Conquistas
                  </button>
                </div>

                {/* Featured Posts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {filteredPosts.filter(post => post.featured).map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {getCategoryIcon(post.category)}
                            <span className="ml-1 capitalize">{post.category}</span>
                          </span>
                          <span className="text-xs text-gray-500">{post.school}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {post.author}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(post.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.views}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Regular Posts */}
                <div className="space-y-4">
                  {filteredPosts.filter(post => !post.featured).map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex gap-6">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                              {getCategoryIcon(post.category)}
                              <span className="ml-1 capitalize">{post.category}</span>
                            </span>
                            <span className="text-xs text-gray-500">{post.school}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {post.author}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(post.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {post.views}
                              </span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {post.likes}
                              </span>
                              <button className="flex items-center text-primary-600 hover:text-primary-700">
                                <Share2 className="h-3 w-3 mr-1" />
                                Compartilhar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <img 
                      src={achievement.image} 
                      alt={achievement.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                          {getCategoryIcon(achievement.category)}
                          <span className="ml-1 capitalize">{achievement.category}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-600">{achievement.year}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                      <p className="text-sm font-medium text-secondary-600">{achievement.school}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">A História da Educação em Vilhena</h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-secondary-600 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">1977 - Fundação da Cidade</h4>
                      <p className="text-gray-600">
                        Com a fundação de Vilhena, as primeiras escolas começaram a surgir para atender 
                        os filhos dos pioneiros. Inicialmente, as aulas eram ministradas em casas adaptadas 
                        e barracões improvisados.
                      </p>
                    </div>

                    <div className="border-l-4 border-secondary-600 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">1980 - Primeira Escola Municipal</h4>
                      <p className="text-gray-600">
                        A primeira escola municipal oficial foi construída no centro da cidade, 
                        atendendo cerca de 150 alunos do ensino fundamental. Era o início de um 
                        sistema educacional que cresceria junto com a cidade.
                      </p>
                    </div>

                    <div className="border-l-4 border-secondary-600 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">1990 - Expansão do Sistema</h4>
                      <p className="text-gray-600">
                        Com o crescimento populacional, novas escolas foram construídas nos bairros 
                        emergentes. A educação infantil ganhou destaque com a criação das primeiras 
                        EMEIs (Escolas Municipais de Educação Infantil).
                      </p>
                    </div>

                    <div className="border-l-4 border-secondary-600 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">2000 - Era Digital</h4>
                      <p className="text-gray-600">
                        O novo milênio trouxe a informatização das escolas. Laboratórios de informática 
                        foram instalados e os professores receberam capacitação para integrar a 
                        tecnologia ao ensino.
                      </p>
                    </div>

                    <div className="border-l-4 border-secondary-600 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">2010 - Ensino Integral</h4>
                      <p className="text-gray-600">
                        Implementação do ensino em tempo integral em várias escolas, oferecendo 
                        atividades complementares como esportes, artes e reforço escolar. 
                        A educação de Vilhena se tornou referência regional.
                      </p>
                    </div>

                    <div className="border-l-4 border-secondary-600 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">2024 - PortalEdu</h4>
                      <p className="text-gray-600">
                        Lançamento do sistema digital unificado de matrículas, trazendo transparência 
                        e eficiência para o processo educacional. Vilhena se posiciona como cidade 
                        inteligente na gestão da educação pública.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="bg-primary-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-primary-600 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Educação de Qualidade</h4>
                    <p className="text-sm text-gray-600">
                      Compromisso com a excelência educacional e formação integral dos estudantes
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="bg-secondary-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                      <Users className="h-6 w-6 text-secondary-600 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Inclusão Social</h4>
                    <p className="text-sm text-gray-600">
                      Educação acessível para todos, respeitando a diversidade e promovendo a igualdade
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="bg-accent-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                      <Trophy className="h-6 w-6 text-accent-600 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Inovação Constante</h4>
                    <p className="text-sm text-gray-600">
                      Sempre buscando novas metodologias e tecnologias para melhorar o ensino
                    </p>
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

export default CultureBlog;