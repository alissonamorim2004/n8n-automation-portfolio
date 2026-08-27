import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, FileText, MapPin, Bell, Download, Upload, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ApplicationStatus: React.FC = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'status' | 'documents' | 'notifications'>('status');

  const applicationData = {
    id: '123456',
    studentName: 'Ana Silva Santos',
    school: 'Escola Municipal Vila Nova',
    level: '1º Ano - Fundamental I',
    class: '1º Ano A',
    status: 'waiting',
    queuePosition: 3,
    priority: 'social',
    submissionDate: '2024-01-15',
    estimatedCall: '2024-03-15',
    parentName: 'Maria Silva Santos',
    phone: '(69) 99999-9999',
    address: 'Rua das Palmeiras, 456 - Vila Nova',
  };

  const documents = [
    { name: 'Certidão de Nascimento', status: 'validated', date: '2024-01-15', feedback: 'Documento validado com sucesso' },
    { name: 'Comprovante de Residência', status: 'validated', date: '2024-01-15', feedback: 'Documento validado com sucesso' },
    { name: 'Cartão de Vacinação', status: 'pending', date: '2024-01-16', feedback: 'Aguardando validação pela escola' },
    { name: 'CPF do Responsável', status: 'rejected', date: '2024-01-14', feedback: 'Documento ilegível. Favor reenviar' },
  ];

  const notifications = [
    { id: 1, type: 'info', title: 'Posição na fila atualizada', message: 'Você subiu para a 3ª posição na fila de espera.', date: '2024-01-20 14:30' },
    { id: 2, type: 'warning', title: 'Documento rejeitado', message: 'CPF do responsável foi rejeitado. Verifique e reenvie.', date: '2024-01-18 10:15' },
    { id: 3, type: 'success', title: 'Documentos validados', message: 'Certidão de nascimento e comprovante de residência foram validados.', date: '2024-01-16 16:45' },
    { id: 4, type: 'info', title: 'Matrícula recebida', message: 'Sua matrícula foi recebida e está sendo processada.', date: '2024-01-15 09:20' },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      waiting: { label: 'Na fila de espera', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      called: { label: 'Chamado para matrícula', color: 'bg-green-100 text-green-800 border-green-200' },
      enrolled: { label: 'Matriculado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      social: { label: 'Prioridade Social', color: 'bg-red-100 text-red-800' },
      proximity: { label: 'Proximidade', color: 'bg-blue-100 text-blue-800' },
      chronological: { label: 'Cronológica', color: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[priority as keyof typeof badges];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      validated: { label: 'Validado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: FileText },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <div className="flex items-center space-x-1">
        <Icon className="h-4 w-4" />
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
          {badge.label}
        </span>
      </div>
    );
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: { icon: Bell, color: 'text-blue-600' },
      warning: { icon: FileText, color: 'text-yellow-600' },
      success: { icon: CheckCircle, color: 'text-green-600' },
    };
    const config = icons[type as keyof typeof icons];
    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.color}`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link to="/cidadao" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Portal
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Acompanhar Matrícula</h1>
                <p className="text-sm text-gray-600">Protocolo: #{applicationData.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{applicationData.studentName}</p>
                <p className="text-xs text-gray-500">{applicationData.school}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <button
                  onClick={() => logout()}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 text-primary-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                #{applicationData.queuePosition}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Posição na Fila</h2>
                <p className="text-sm text-gray-600">{applicationData.level} - {applicationData.class}</p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(applicationData.status)}
              <div className="mt-2">
                {getPriorityBadge(applicationData.priority)}
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Data de Matrícula</p>
              <p className="font-medium text-gray-900">{new Date(applicationData.submissionDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-gray-600">Previsão de Chamada</p>
              <p className="font-medium text-gray-900">{new Date(applicationData.estimatedCall).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-gray-600">Telefone de Contato</p>
              <p className="font-medium text-gray-900">{applicationData.phone}</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso da Matrícula</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Matrícula Enviada</span>
            </div>
            <div className="flex-1 h-2 bg-gray-200 mx-4 rounded">
              <div className="h-2 bg-yellow-500 rounded" style={{ width: '60%' }}></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-yellow-600">Na Fila de Espera</span>
            </div>
            <div className="flex-1 h-2 bg-gray-200 mx-4 rounded">
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                <Bell className="h-5 w-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Chamada para Matrícula</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('status')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'status'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Status Detalhado
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documentos
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notificações
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Dados da Matrícula</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aluno:</span>
                        <span className="font-medium">{applicationData.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Responsável:</span>
                        <span className="font-medium">{applicationData.parentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Escola:</span>
                        <span className="font-medium">{applicationData.school}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turma:</span>
                        <span className="font-medium">{applicationData.class}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Localização</h4>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      {applicationData.address}
                    </div>
                    <p className="text-xs text-gray-500">
                      Distância da escola: ~1.2 km
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Próximos Passos</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Aguarde ser chamado para matrícula</li>
                    <li>• Mantenha os documentos atualizados</li>
                    <li>• Acompanhe as notificações via WhatsApp</li>
                    <li>• Entre em contato conosco em caso de dúvidas</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Status dos Documentos</h4>
                  <button className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Documento
                  </button>
                </div>
                {documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{doc.name}</h5>
                      {getDocumentStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{doc.feedback}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Enviado em {new Date(doc.date).toLocaleDateString('pt-BR')}</span>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700">Visualizar</button>
                        {doc.status === 'rejected' && (
                          <button className="text-primary-600 hover:text-primary-700">Reenviar</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Histórico de Notificações</h4>
                {notifications.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{notification.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-gray-100 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Precisa de Ajuda?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 mb-2">Contato da Escola</p>
              <p className="text-gray-700">📞 (69) 3321-8765</p>
              <p className="text-gray-700">📧 vila.nova@vilhena.ro.gov.br</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">SEMED - Atendimento</p>
              <p className="text-gray-700">📞 (69) 3321-4567</p>
              <p className="text-gray-700">🕒 Segunda a Sexta, 7h às 17h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;