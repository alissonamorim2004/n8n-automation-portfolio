import React from 'react';
import { Link } from 'react-router-dom';
import { School, MapPin, Users, GraduationCap, Shield, Bell, LogIn, UserPlus, BookOpen, Megaphone } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PortalEdu</h1>
                <p className="text-sm text-gray-600">Vilhena - RO</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/cultura" 
                className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Cultura & Blog
              </Link>
              <Link 
                to="/campanhas" 
                className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Campanhas
              </Link>
              <Link 
                to="/login" 
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
              <Link 
                to="/cadastro" 
                className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Sua vaga, <span className="text-primary-600">sua escola</span>,<br />
              <span className="text-secondary-600">seu futuro</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Sistema unificado de matrículas escolares de Vilhena, do Jardim I ao Ensino Médio.
              Transparência, eficiência e proximidade para toda a família.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/cadastro" 
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Criar Conta Gratuita
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center bg-white hover:bg-gray-50 text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-primary-600 transition-colors"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            <Link 
              to="/cultura" 
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Cultura & Histórias</span>
            </Link>
            <Link 
              to="/campanhas" 
              className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Megaphone className="h-5 w-5" />
              <span className="font-medium">Campanhas Ativas</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Access Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Acesso por Perfil
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <Users className="h-8 w-8 text-primary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Portal do Cidadão</h3>
              <p className="text-gray-600 mb-4">
                Matricule seu filho, acompanhe a posição na fila e receba notificações em tempo real.
              </p>
              <div className="text-primary-600 font-medium group-hover:text-primary-700">
                Para pais e responsáveis
              </div>
            </div>

            <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-secondary-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <School className="h-8 w-8 text-secondary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Painel da Escola</h3>
              <p className="text-gray-600 mb-4">
                Gerencie vagas, valide documentos e acompanhe o processo de matrícula.
              </p>
              <div className="text-secondary-600 font-medium group-hover:text-secondary-700">
                Para escolas municipais
              </div>
            </div>

            <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-accent-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-accent-200 transition-colors">
                <Shield className="h-8 w-8 text-accent-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">SEMED Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Visão estratégica, mapas interativos e relatórios para planejamento educacional.
              </p>
              <div className="text-accent-600 font-medium group-hover:text-accent-700">
                Para gestores públicos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Funcionalidades Principais
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Proximidade Geográfica</h4>
              <p className="text-sm text-gray-600">Alocação inteligente baseada na distância casa-escola</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Bell className="h-6 w-6 text-secondary-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Notificações Instantâneas</h4>
              <p className="text-sm text-gray-600">WhatsApp, SMS e email para todas as atualizações</p>
            </div>
            <div className="text-center">
              <div className="bg-accent-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <Shield className="h-6 w-6 text-accent-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Critérios Sociais</h4>
              <p className="text-sm text-gray-600">Prioridade para Bolsa Família e necessidades especiais</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                <GraduationCap className="h-6 w-6 text-primary-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Jardim I ao Ensino Médio</h4>
              <p className="text-sm text-gray-600">Acompanhamento completo da jornada educacional</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para começar?
          </h3>
          <p className="text-xl text-primary-100 mb-8">
            Crie sua conta gratuita e tenha acesso completo ao sistema de matrículas de Vilhena
          </p>
          <Link 
            to="/cadastro" 
            className="inline-flex items-center bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Cadastrar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-primary-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">PortalEdu Vilhena</h3>
                <p className="text-sm text-gray-400">Secretaria Municipal de Educação</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                Sistema desenvolvido para transparência e eficiência
              </p>
              <p className="text-xs text-gray-500 mt-1">
                © 2024 Prefeitura Municipal de Vilhena - RO
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;