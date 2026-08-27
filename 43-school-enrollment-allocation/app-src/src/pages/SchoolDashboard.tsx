import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, Users, FileText, CheckCircle, Clock, Upload, Eye, ArrowLeft, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Vacancy {
  id: string;
  class: string;
  level: string;
  capacity: number;
  occupied: number;
  waitingList: number;
}

interface Student {
  id: string;
  name: string;
  dateOfBirth: string;
  priority: 'social' | 'proximity' | 'chronological';
  documents: {
    name: string;
    status: 'pending' | 'validated' | 'rejected';
    uploadDate: string;
  }[];
  queuePosition: number;
  notificationSent: boolean;
}

const SchoolDashboard: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'documents'>('overview');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const vacancies: Vacancy[] = [
    { id: '1', class: '1º Ano A', level: 'Fundamental I', capacity: 25, occupied: 23, waitingList: 8 },
    { id: '2', class: '1º Ano B', level: 'Fundamental I', capacity: 25, occupied: 25, waitingList: 12 },
    { id: '3', class: '2º Ano A', level: 'Fundamental I', capacity: 25, occupied: 22, waitingList: 5 },
    { id: '4', class: '3º Ano A', level: 'Fundamental I', capacity: 25, occupied: 24, waitingList: 15 },
    { id: '5', class: '6º Ano A', level: 'Fundamental II', capacity: 30, occupied: 28, waitingList: 18 },
    { id: '6', class: '1º Médio A', level: 'Ensino Médio', capacity: 35, occupied: 33, waitingList: 22 },
  ];

  const queueStudents: Student[] = [
    {
      id: '1',
      name: 'Ana Silva Santos',
      dateOfBirth: '2015-03-15',
      priority: 'social',
      queuePosition: 1,
      notificationSent: true,
      documents: [
        { name: 'Certidão de Nascimento', status: 'validated', uploadDate: '2024-01-15' },
        { name: 'Comprovante de Residência', status: 'validated', uploadDate: '2024-01-15' },
        { name: 'Cartão de Vacinação', status: 'pending', uploadDate: '2024-01-16' },
      ]
    },
    {
      id: '2',
      name: 'Carlos Pereira Lima',
      dateOfBirth: '2015-07-22',
      priority: 'proximity',
      queuePosition: 2,
      notificationSent: false,
      documents: [
        { name: 'Certidão de Nascimento', status: 'validated', uploadDate: '2024-01-14' },
        { name: 'Comprovante de Residência', status: 'pending', uploadDate: '2024-01-14' },
      ]
    },
    {
      id: '3',
      name: 'Maria Oliveira Costa',
      dateOfBirth: '2015-09-10',
      priority: 'chronological',
      queuePosition: 3,
      notificationSent: false,
      documents: [
        { name: 'Certidão de Nascimento', status: 'validated', uploadDate: '2024-01-13' },
        { name: 'Comprovante de Residência', status: 'validated', uploadDate: '2024-01-13' },
        { name: 'Cartão de Vacinação', status: 'validated', uploadDate: '2024-01-13' },
      ]
    },
  ];

  const handleReleaseVacancy = (classId: string) => {
    setSelectedClass(classId);
    setShowReleaseModal(true);
  };

  const confirmReleaseVacancy = () => {
    // Mock notification sending
    setShowReleaseModal(false);
    alert('Vaga liberada! Notificação enviada para Ana Silva Santos via WhatsApp.');
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      social: { label: 'Prioridade Social', color: 'bg-red-100 text-red-800 border-red-200' },
      proximity: { label: 'Proximidade', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      chronological: { label: 'Cronológica', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const badge = badges[priority as keyof typeof badges];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      validated: { label: 'Validado', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
    };
    
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-secondary-600 p-2 rounded-lg">
                  <School className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-sm text-gray-600">Painel Operacional</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{(user?.profile as any)?.principalName}</p>
                <p className="text-xs text-gray-500">Diretor(a)</p>
              </div>
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
        {/* School Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-48 h-32">
              <img 
                src={(user?.profile as any)?.images?.[0] || 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg'} 
                alt={user?.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user?.name}</h2>
              <p className="text-gray-600 mb-4">{(user?.profile as any)?.description}</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Endereço</p>
                  <p className="font-medium text-gray-900">{(user?.profile as any)?.address}</p>
                </div>
                <div>
                  <p className="text-gray-600">Capacidade Total</p>
                  <p className="font-medium text-gray-900">{(user?.profile as any)?.capacity} alunos</p>
                </div>
                <div>
                  <p className="text-gray-600">Níveis de Ensino</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(user?.profile as any)?.levels?.map((level: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-medium rounded-full">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">155</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vagas Ocupadas</p>
                <p className="text-2xl font-bold text-gray-900">155/185</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lista de Espera</p>
                <p className="text-2xl font-bold text-gray-900">80</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Docs Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
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
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Visão Geral das Turmas
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'queue'
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fila de Espera
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Validação de Documentos
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Turmas e Ocupação</h3>
                {vacancies.map((vacancy) => (
                  <div key={vacancy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{vacancy.class}</h4>
                          <p className="text-sm text-gray-600">{vacancy.level}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Ocupação: </span>
                          <span className="font-medium">{vacancy.occupied}/{vacancy.capacity}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Fila: </span>
                          <span className="font-medium text-yellow-600">{vacancy.waitingList}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-secondary-600 h-2 rounded-full" 
                            style={{ width: `${(vacancy.occupied / vacancy.capacity) * 100}%` }}
                          ></div>
                        </div>
                        {vacancy.occupied < vacancy.capacity ? (
                          <span className="text-green-600 text-sm font-medium">
                            {vacancy.capacity - vacancy.occupied} vagas
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReleaseVacancy(vacancy.id)}
                            className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Liberar Vaga
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'queue' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos da Fila - 1º Ano A</h3>
                {queueStudents.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 text-primary-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {student.queuePosition}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">Nascimento: {new Date(student.dateOfBirth).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(student.priority)}
                        {student.notificationSent && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">
                            Notificado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {student.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{doc.name}</span>
                          {getDocumentStatusBadge(doc.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos Aguardando Validação</h3>
                <div className="space-y-4">
                  {queueStudents.filter(s => s.documents.some(d => d.status === 'pending')).map((student) => (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <span className="text-sm text-gray-600">Posição na fila: #{student.queuePosition}</span>
                      </div>
                      <div className="space-y-2">
                        {student.documents.filter(d => d.status === 'pending').map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-yellow-600" />
                              <div>
                                <span className="font-medium text-gray-900">{doc.name}</span>
                                <p className="text-sm text-gray-600">Enviado em {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                                <Eye className="h-4 w-4 mr-1" />
                                Visualizar
                              </button>
                              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                                Validar
                              </button>
                              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium">
                                Rejeitar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Release Vacancy Modal */}
        {showReleaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Liberação de Vaga</h3>
              <p className="text-gray-600 mb-6">
                Ao liberar esta vaga, o próximo aluno da fila (Ana Silva Santos) será automaticamente notificado via WhatsApp 
                com instruções para matrícula e agendamento.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReleaseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReleaseVacancy}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium"
                >
                  Confirmar Liberação
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDashboard;