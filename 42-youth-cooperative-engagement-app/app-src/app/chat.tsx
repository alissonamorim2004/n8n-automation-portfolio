import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Send, Bot } from 'lucide-react-native';
import { router } from 'expo-router';
import { chatResponses } from '@/data/mockData';
import { ChatMessage } from '@/types';

const QUICK_SUGGESTIONS = [
  'O que é cooperativismo?',
  'Como ganho pontos?',
  'Como resgato?',
  'Para que servem os pontos?',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! 👋 Eu sou a assistente do CoopTok! Estou aqui para ajudar você com dúvidas sobre cooperativismo, como ganhar pontos e muito mais. Como posso ajudar?',
      isBot: true,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(chatResponses)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return response;
      }
    }
    
    // Default responses for common words
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('hey')) {
      return 'Oi! 😊 Como posso ajudar você hoje? Posso falar sobre cooperativismo, pontos, recompensas e muito mais!';
    }
    
    if (lowerMessage.includes('obrigad')) {
      return 'De nada! 😊 Estou sempre aqui para ajudar. Tem mais alguma dúvida sobre o CoopTok?';
    }
    
    if (lowerMessage.includes('tchau') || lowerMessage.includes('até')) {
      return 'Até mais! 👋 Continue aproveitando o CoopTok e não esqueça de completar suas missões diárias!';
    }
    
    return 'Interessante! 🤔 Embora eu seja focada em cooperativismo e no app CoopTok, posso te ajudar com:\n\n• Como o cooperativismo funciona\n• Formas de ganhar pontos\n• Sistema de recompensas\n• Dúvidas sobre missões\n\nO que você gostaria de saber?';
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      message.isBot ? styles.botMessageContainer : styles.userMessageContainer,
    ]}>
      {message.isBot && (
        <View style={styles.botIcon}>
          <Bot size={16} color="#0D0E16" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        message.isBot ? styles.botMessage : styles.userMessage,
      ]}>
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botMessageText : styles.userMessageText,
        ]}>
          {message.text}
        </Text>
      </View>
    </View>
  );

  const TypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessageContainer]}>
      <View style={styles.botIcon}>
        <Bot size={16} color="#0D0E16" />
      </View>
      <View style={[styles.messageBubble, styles.botMessage, styles.typingBubble]}>
        <Text style={styles.typingText}>digitando...</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#EDEDED" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.assistantIcon}>
            <Bot size={20} color="#0D0E16" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Assistente CoopTok</Text>
            <Text style={styles.headerSubtitle}>
              {isTyping ? 'digitando...' : 'online'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Suggestions */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.suggestionsContainer}>
        {QUICK_SUGGESTIONS.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => sendMessage(suggestion)}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua pergunta..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim()}>
          <Send size={20} color={inputText.trim() ? '#0D0E16' : '#666'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0E16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 241, 229, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assistantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27F1E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#EDEDED',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 60,
  },
  suggestionChip: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
  },
  suggestionText: {
    color: '#27F1E5',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#27F1E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 2,
  },
  botMessage: {
    backgroundColor: 'rgba(39, 241, 229, 0.1)',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: '#27F1E5',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#EDEDED',
  },
  userMessageText: {
    color: '#0D0E16',
    fontWeight: '500',
  },
  typingBubble: {
    paddingVertical: 8,
  },
  typingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 241, 229, 0.1)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#EDEDED',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(39, 241, 229, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#27F1E5',
  },
});