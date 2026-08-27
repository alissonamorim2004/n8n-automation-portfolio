import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, School, Shield, ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [userType, setUserType] = useState<'citizen' | 'school' | ''>('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados básicos
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    
    // Dados do cidadão
    cpf: '',
    phone: '',
    address: '',
    district: '',
    cep: '',
    familyIncome: '',
    hasBolsaFamilia: false,
    children: [] as any[],
    
    // Dados da escola
    cnpj: '',
    principalName: '',
    capacity: '',
    levels: [] as string[],
    infrastructure: [] as string[],
    requiredDocuments: [] as string[],
    description: '',
    images: [] as string[]
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const vilhenaBairros = [
    'Centro', 'Vila Nova', 'Jardim Eldorado', 'Residencial Oliveira',
    'Parque Industrial', 'Jardim América', 'Bodoquena', 'Cristo Rei',
    'Jardim Primavera', 'Vila Operária', 'Setor 14', 'Setor 15'
  ];

  const ensino_levels = [
    'Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio'
  ];

  const infrastructure_options = [
    'Biblioteca', 'Laboratório de Informática', 'Laboratório de Ciências',
    'Quadra Esportiva', 'Refeitório', 'Auditório', 'Sala de Artes',
    'Sala de Música', 'Pátio Coberto', 'Playground'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { name: '', birthDate: '', hasSpecialNeeds: false, specialNeedsDescription: '' }]
    }));
  };

  const removeChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChild = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    setLoading(true);

    const userData = {
      email: formData.email,
      type: userType,
      name: formData.name,
      profile: userType === 'citizen' ? {
        cpf: formData.cpf,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        cep: formData.cep,
        familyIncome: parseFloat(formData.familyIncome),
        hasBolsaFamilia: formData.hasBolsaFamilia,
        children: formData.children
      } : {
        cnpj: formData.cnpj,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        cep: formData.cep,
        principalName: formData.principalName,
        capacity: parseInt(formData.capacity),
        levels: formData.levels,
        infrastructure: formData.infrastructure,
        requiredDocuments: formData.requiredDocuments,
        description: formData.description,
        images: formData.images
      }
    };

    const success = await register(userData);
    
    if (success) {
      navigate(userType === 'citizen' ? '/cidadao' : userType === 'school' ? '/escola' : '/semed');
    } else {
      alert('Erro ao criar conta. Tente novamente.');
    }
    
    setLoading(false);
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-600 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Conta no PortalEdu
            </h2>
            <p className="text-gray-600">
              Escolha o tipo de conta que deseja criar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setUserType('citizen')}
              className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <User className="h-8 w-8 text-primary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cidadão/Responsável</h3>
              <p className="text-gray-600 mb-4">
                Para pais e responsáveis que desejam matricular seus filhos nas escolas municipais
              </p>
              <div className="text-primary-600 font-medium group-hover:text-primary-700">
                Criar conta de cidadão
              </div>
            </button>

            <button
              onClick={() => setUserType('school')}
              className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="bg-secondary-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <School className="h-8 w-8 text-secondary-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Escola Municipal</h3>
              <p className="text-gray-600 mb-4">
                Para escolas municipais gerenciarem suas vagas e processos de matrícula
              </p>
              <div className="text-secondary-600 font-medium group-hover:text-secondary-700">
                Criar conta de escola
              </div>
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Faça login aqui
              </Link>
            </p>
            <Link to="/" className="inline-block mt-4 text-sm text-gray-600 hover:text-gray-900">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button 
              onClick={() => setUserType('')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                {userType === 'citizen' ? <User className="h-6 w-6 text-white" /> : <School className="h-6 w-6 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Cadastro de {userType === 'citizen' ? 'Cidadão' : 'Escola'}
                </h1>
                <p className="text-sm text-gray-600">
                  Passo {step} de {userType === 'citizen' ? '3' : '2'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            {/* Passo 1: Dados básicos */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Dados Básicos</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {userType === 'citizen' ? 'CPF' : 'CNPJ'} *
                    </label>
                    <input
                      type="text"
                      name={userType === 'citizen' ? 'cpf' : 'cnpj'}
                      value={userType === 'citizen' ? formData.cpf : formData.cnpj}
                      onChange={handleInputChange}
                      required
                      placeholder={userType === 'citizen' ? '000.000.000-00' : '00.000.000/0001-00'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
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
                      {vilhenaBairros.map(bairro => (
                        <option key={bairro} value={bairro}>{bairro}</option>
                      ))}
                    </select>
                  </div>
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
                </div>
              </div>
            )}

            {/* Passo 2: Dados específicos do cidadão */}
            {step === 2 && userType === 'citizen' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informações Familiares</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Renda Familiar Mensal (R$) *
                    </label>
                    <input
                      type="number"
                      name="familyIncome"
                      value={formData.familyIncome}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex items-center pt-8">
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
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filhos</h3>
                    <button
                      type="button"
                      onClick={addChild}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Adicionar Filho
                    </button>
                  </div>
                  
                  {formData.children.map((child, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Filho {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeChild(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo
                          </label>
                          <input
                            type="text"
                            value={child.name}
                            onChange={(e) => updateChild(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Nascimento
                          </label>
                          <input
                            type="date"
                            value={child.birthDate}
                            onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={child.hasSpecialNeeds}
                            onChange={(e) => updateChild(index, 'hasSpecialNeeds', e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Possui necessidades especiais
                          </label>
                        </div>
                        
                        {child.hasSpecialNeeds && (
                          <div className="mt-2">
                            <textarea
                              value={child.specialNeedsDescription || ''}
                              onChange={(e) => updateChild(index, 'specialNeedsDescription', e.target.value)}
                              placeholder="Descreva as necessidades especiais"
                              rows={3}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passo 2: Dados específicos da escola */}
            {step === 2 && userType === 'school' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informações da Escola</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Diretor *
                    </label>
                    <input
                      type="text"
                      name="principalName"
                      value={formData.principalName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacidade Total de Alunos *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Níveis de Ensino Oferecidos *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ensino_levels.map(level => (
                      <div key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.levels.includes(level)}
                          onChange={(e) => handleArrayChange('levels', level, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">{level}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Infraestrutura Disponível
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {infrastructure_options.map(item => (
                      <div key={item} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.infrastructure.includes(item)}
                          onChange={(e) => handleArrayChange('infrastructure', item, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Escola
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Descreva a escola, sua missão, valores e diferenciais..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Passo 3: Confirmação (apenas para cidadão) */}
            {step === 3 && userType === 'citizen' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Confirmação dos Dados</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Dados Pessoais</h3>
                    <p className="text-sm text-gray-600">Nome: {formData.name}</p>
                    <p className="text-sm text-gray-600">Email: {formData.email}</p>
                    <p className="text-sm text-gray-600">CPF: {formData.cpf}</p>
                    <p className="text-sm text-gray-600">Telefone: {formData.phone}</p>
                    <p className="text-sm text-gray-600">Endereço: {formData.address}, {formData.district}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Informações Familiares</h3>
                    <p className="text-sm text-gray-600">Renda Familiar: R$ {formData.familyIncome}</p>
                    {formData.hasBolsaFamilia && (
                      <p className="text-sm text-green-600">✓ Beneficiário do Bolsa Família</p>
                    )}
                    <p className="text-sm text-gray-600">Filhos cadastrados: {formData.children.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Anterior
                </button>
              )}
              
              {step < (userType === 'citizen' ? 3 : 2) ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-6 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;