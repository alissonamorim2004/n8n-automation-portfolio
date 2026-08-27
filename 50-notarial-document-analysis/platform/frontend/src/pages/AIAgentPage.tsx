import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, Loader2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { documentsApi, analysisTypesApi } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string; size: number }[];
}

export default function AIAgentPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Agente AI da Plataforma. Posso ajudá-lo a analisar documentos, responder perguntas e auxiliar em suas tarefas. Como posso ajudar hoje?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisTypes, setAnalysisTypes] = useState<any[]>([]);
  const [selectedAnalysisTypeId, setSelectedAnalysisTypeId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadAnalysisTypes();
  }, []);

  const loadAnalysisTypes = async () => {
    const response = await analysisTypesApi.getAll(true);
    if (response.data) {
      setAnalysisTypes(response.data);
      if (response.data.length > 0) {
        setSelectedAnalysisTypeId(response.data[0].id);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;
    if (!selectedAnalysisTypeId) {
      alert('Selecione um tipo de análise');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: files.map(f => ({ name: f.name, type: f.type, size: f.size })),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let documentId = '';

      if (files.length > 0) {
        const file = files[0];
        const base64 = await fileToBase64(file);
        const fileUrl = `data:${file.type};base64,${base64}`;

        const docResponse = await documentsApi.createForChat({
          fileName: file.name,
          fileUrl: fileUrl,
          analysisTypeId: selectedAnalysisTypeId,
        });

        if (docResponse.data) {
          documentId = docResponse.data.id;
        }
      }

      const filesData = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: await fileToBase64(file),
        }))
      );

      const response = await fetch('${N8N_WEBHOOK_CHAT_URL}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile?.id,
          userName: profile?.full_name,
          userEmail: profile?.email,
          message: input,
          files: filesData,
          documentId: documentId,
          analysisTypeId: selectedAnalysisTypeId,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar mensagem');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.output || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setFiles([]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Agente AI
        </h2>
        <p className="text-slate-600 mt-1">
          Converse com o assistente inteligente e analise documentos
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-2 border-blue-200 shadow-lg">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500'
                    : 'bg-gradient-to-br from-purple-600 to-pink-500'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {message.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-2 py-1 rounded flex items-center gap-2 ${
                            message.role === 'user' ? 'bg-white/20' : 'bg-slate-200'
                          }`}
                        >
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <p className={`text-xs text-slate-400 mt-1 px-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t-2 border-slate-200 p-4 bg-slate-50">
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Análise
            </label>
            <select
              value={selectedAnalysisTypeId}
              onChange={(e) => setSelectedAnalysisTypeId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {analysisTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm border border-blue-300"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-shrink-0 border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            >
              <Paperclip className="w-5 h-5 text-blue-600" />
            </Button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              className="flex-1 resize-none border-2 border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              rows={1}
              style={{ maxHeight: '120px' }}
            />

            <Button
              onClick={handleSend}
              disabled={loading || (!input.trim() && files.length === 0)}
              className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
