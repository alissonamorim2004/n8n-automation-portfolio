import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

const INTERESTS = [
  'finanças',
  'empreendedorismo',
  'sustentabilidade',
  'cooperativismo',
  'agro',
];

export default function LoginScreen() {
  const { login } = useApp();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 3) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !handle.trim() || selectedInterests.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await login({
        name: name.trim(),
        handle: handle.trim().toLowerCase(),
        avatar: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=200`,
        region: 'São Paulo',
        interests: selectedInterests,
      });
      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = name.trim() && handle.trim() && selectedInterests.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>CoopTok</Text>
          <Text style={styles.slogan}>Divirta-se, Coopere.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Bem-vindo! 👋</Text>
          <Text style={styles.subtitle}>
            Vamos criar seu perfil para personalizar sua experiência
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              placeholderTextColor="#666"
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome de usuário</Text>
            <View style={styles.handleInputContainer}>
              <Text style={styles.handlePrefix}>@</Text>
              <TextInput
                style={styles.handleInput}
                value={handle}
                onChangeText={(text) => setHandle(text.replace(/[^a-z0-9_]/g, ''))}
                placeholder="seuusuario"
                placeholderTextColor="#666"
                maxLength={20}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Escolha seus interesses ({selectedInterests.length}/3)
            </Text>
            <Text style={styles.labelSubtext}>
              Isso nos ajuda a personalizar o conteúdo para você
            </Text>
            
            <View style={styles.interestsContainer}>
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestButton,
                      isSelected && styles.selectedInterestButton,
                    ]}
                    onPress={() => toggleInterest(interest)}
                    disabled={!isSelected && selectedInterests.length >= 3}>
                    <Text style={[
                      styles.interestText,
                      isSelected && styles.selectedInterestText,
                    ]}>
                      {interest}
                    </Text>
                    {isSelected && (
                      <CheckCircle size={16} color="#0D0E16" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, canSubmit && styles.submitButtonActive]}
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}>
            <Text style={[
              styles.submitButtonText,
              canSubmit && styles.submitButtonTextActive,
            ]}>
              {isLoading ? 'Criando conta...' : 'Começar 🚀'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0E16',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#27F1E5',
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  form: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EDEDED',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EDEDED',
    marginBottom: 8,
  },
  labelSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#EDEDED',
  },
  handleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
    borderRadius: 12,
  },
  handlePrefix: {
    color: '#27F1E5',
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 16,
  },
  handleInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 8,
    fontSize: 16,
    color: '#EDEDED',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(237, 237, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(39, 241, 229, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  selectedInterestButton: {
    backgroundColor: '#27F1E5',
    borderColor: '#27F1E5',
  },
  interestText: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedInterestText: {
    color: '#0D0E16',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: 'rgba(39, 241, 229, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  submitButtonActive: {
    backgroundColor: '#27F1E5',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  submitButtonTextActive: {
    color: '#0D0E16',
  },
});