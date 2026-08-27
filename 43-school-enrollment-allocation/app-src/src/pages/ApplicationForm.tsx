import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Check, MapPin, AlertCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  studentName: string;
  birthDate: string;
  parentName: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  cep: string;
  district: string;
  hasBolsaFamilia: boolean;
  hasSpecialNeeds: boolean;
  specialNeedsDescription: string;
  selectedSchool: string;
  selectedLevel: string;
  preferredClass: string;
}

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    birthDate: '',
    parentName: user?.name || '',
    cpf: (user?.profile as any)?.cpf || '',
    phone: (user?.profile as any)?.phone || '',
    email: user?.email || '',
    address: (user?.profile as any)?.address || '',
    cep: (user?.profile as any)?.cep || '',
    district: (user?.profile as any)?.district || '',
    hasBolsaFamilia: (user?.profile as any)?.hasBolsaFamilia || false,
    hasSpecialNeeds: false,
    specialNeedsDescription: '',
    selectedSchool: '',
    selectedLevel: '',
    preferredClass: '',
  });
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: boolean }>({});

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileUpload = (docType: string) => {
    // Mock file upload
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: true
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    navigate('/status/123456');
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Dados do Aluno', completed: currentStep > 1 },
    { number: 2, title: 'Dados do Responsável', completed: currentStep > 2 },
    { number: 3, title: 'Escola e Documentos', completed: currentStep > 3 },
    { number: 4, title: 'Confirmação', completed: false },
  ];

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
              <div className="ml-6">
                <h1 className="text-xl font-bold text-gray-900">Nova Matrícula</h1>
                <p className="text-sm text-gray-600">Preencha os dados para matricular seu filho</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">{user?.name}</span>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed ? 'bg-primary-600 border-primary-600' :
                  currentStep === step.number ? 'border-primary-600 text-primary-600' :
                  'border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className="font-medium">{step.number}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step.completed ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.number} className={`text-sm font-medium ${
                currentStep === step.number ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Dados do Aluno</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo do Aluno *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasBolsaFamilia"
                      checked={formData.hasBolsaFamilia}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Família beneficiária do Bolsa Família
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasSpecialNeeds"
                      checked={formData.hasSpecialNeeds}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Aluno com necessidades especiais
                    </label>
                  </div>
                  {formData.hasSpecialNeeds && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descreva as necessidades especiais
                      </label>
                      <textarea
                        name="specialNeedsDescription"
                        value={formData.specialNeedsDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Dados do Responsável</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Informação:</strong> Os dados abaixo foram preenchidos automaticamente com base no seu cadastro. 
                    Você pode alterá-los se necessário.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo do Responsável *
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      required
                      placeholder="000.000.000-00"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone/WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(69) 99999-9999"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Rua, número, complemento"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP *
                    </label>
                    <input
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      required
                      placeholder="76980-000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione o bairro</option>
                      <option value="Centro">Centro</option>
                      <option value="Vila Nova">Vila Nova</option>
                      <option value="Jardim Eldorado">Jardim Eldorado</option>
                      <option value="Residencial Oliveira">Residencial Oliveira</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Escola e Documentos</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escola de Preferência *
                    </label>
                    <select
                      name="selectedSchool"
                      value={formData.selectedSchool}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione a escola</option>
                      <option value="centro">E.M. Centro</option>
                      <option value="vila-nova">E.M. Vila Nova</option>
                      <option value="jardim">EMEI Jardim Eldorado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível de Ensino *
                    </label>
                    <select
                      name="selectedLevel"
                      value={formData.selectedLevel}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione o nível</option>
                      <option value="infantil">Educação Infantil</option>
                      <option value="fundamental1">Fundamental I</option>
                      <option value="fundamental2">Fundamental II</option>
                      <option value="medio">Ensino Médio</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload de Documentos</h3>
                  <div className="space-y-4">
                    {[
                      'Certidão de Nascimento (Frente e Verso)',
                      'Comprovante de Residência (Atual)',
                      'Cartão de Vacinação (Atualizado)',
                      'CPF do Responsável'
                    ].map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{doc}</span>
                          {uploadedDocs[doc] ? (
                            <div className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-sm">Enviado</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFileUpload(doc)}
                              className="flex items-center px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Confirmação dos Dados</h2>
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Dados do Aluno</h3>
                    <p className="text-sm text-gray-600">Nome: {formData.studentName}</p>
                    <p className="text-sm text-gray-600">Data de Nascimento: {formData.birthDate}</p>
                    {formData.hasBolsaFamilia && (
                      <p className="text-sm text-green-600">✓ Prioridade Social (Bolsa Família)</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Responsável</h3>
                    <p className="text-sm text-gray-600">Nome: {formData.parentName}</p>
                    <p className="text-sm text-gray-600">Telefone: {formData.phone}</p>
                    <p className="text-sm text-gray-600">Endereço: {formData.address}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Escola</h3>
                    <p className="text-sm text-gray-600">Escola: {formData.selectedSchool}</p>
                    <p className="text-sm text-gray-600">Nível: {formData.selectedLevel}</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Importante</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Após o envio, você receberá um protocolo e poderá acompanhar o status da matrícula. 
                        Notificações serão enviadas via WhatsApp quando houver atualizações.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Anterior
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-6 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium"
                >
                  Finalizar Matrícula
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;