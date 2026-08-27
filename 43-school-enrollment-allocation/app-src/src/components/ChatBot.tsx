import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual do PortalEdu Vilhena. Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickReplies = [
    'Como fazer matrícula?',
    'Documentos necessários',
    'Escolas próximas',
    'Status da matrícula',
    'Contato das escolas'
  ];

  const botResponses: { [key: string]: string } = {
    'como fazer matrícula': 'Para fazer a matrícula, acesse o Portal do Cidadão, clique em "Nova Matrícula" e preencha todos os dados solicitados. Você precisará de documentos como certidão de nascimento, comprovante de residência e cartão de vacinação.',
    'documentos necessários': 'Os documentos necessários são: Certidão de Nascimento (original e cópia), Comprovante de Residência atualizado, Cartão de Vacinação, CPF e RG do responsável. Algumas escolas podem solicitar documentos adicionais.',
    'escolas próximas': 'Use o Mapa de Proximidade no Portal do Cidadão para ver as escolas mais próximas da sua residência. O sistema considera sua localização e mostra as opções disponíveis com distâncias e vagas.',
    'status da matrícula': 'Você pode acompanhar o status da sua matrícula na seção "Minhas Matrículas" do Portal do Cidadão. Lá você verá sua posição na fila, documentos validados e próximos passos.',
    'contato das escolas': 'Cada escola tem seu telefone de contato. No mapa ou na lista de escolas, clique na escola desejada para ver o telefone e endereço. Para dúvidas gerais, entre em contato com a SEMED: (69) 3321-4567.',
    'bolsa família': 'Famílias beneficiárias do Bolsa Família têm prioridade no sistema de alocação. Certifique-se de marcar essa opção durante o cadastro para garantir sua prioridade social.',
    'lista de espera': 'A lista de espera funciona por ordem de prioridade: 1º Bolsa Família, 2º Proximidade geográfica, 3º Ordem cronológica. Você receberá notificações via WhatsApp quando houver movimentação.',
    'horário funcionamento': 'As escolas municipais funcionam das 7h às 17h, de segunda a sexta. A SEMED atende das 7h às 17h para dúvidas sobre matrículas e documentação.',
    'default': 'Desculpe, não entendi sua pergunta. Você pode tentar uma das opções rápidas abaixo ou reformular sua pergunta. Para atendimento especializado, entre em contato com a SEMED: (69) 3321-4567.'
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular resposta do bot
    setTimeout(() => {
      const lowerInput = inputText.toLowerCase();
      let response = botResponses.default;

      // Buscar resposta baseada em palavras-chave
      for (const [key, value] of Object.entries(botResponses)) {
        if (key !== 'default' && lowerInput.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Assistente PortalEdu</h3>
                <p className="text-xs opacity-90">Online agora</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 mt-0.5 text-primary-600" />
                    )}
                    <p>{message.text}</p>
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Perguntas frequentes:</p>
              <div className="flex flex-wrap gap-1">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;