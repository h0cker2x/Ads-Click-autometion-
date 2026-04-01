import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [savedSettings, setSavedSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('automationSettings');
      if (settings) {
        setSavedSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleStartAutomation = () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    navigation.navigate('Browser', { 
      targetUrl: url,
      settings: savedSettings 
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>URL Input</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter website URL (e.g., https://example.com)"
          placeholderTextColor="#999"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Current Settings</Text>
        {savedSettings ? (
          <View>
            <Text style={styles.settingText}>
              Target Tag: <Text style={styles.bold}>{savedSettings.targetTag}</Text>
            </Text>
            <Text style={styles.settingText}>
              Reload on Error: <Text style={styles.bold}>{savedSettings.reloadOnError ? 'Yes' : 'No'}</Text>
            </Text>
            <Text style={styles.settingText}>
              Handle Dynamic Content: <Text style={styles.bold}>{savedSettings.handleDynamicContent ? 'Yes' : 'No'}</Text>
            </Text>
            <Text style={styles.settingText}>
              Timeout: <Text style={styles.bold}>{savedSettings.timeout}s</Text>
            </Text>
          </View>
        ) : (
          <Text style={styles.noSettings}>No settings configured. Please go to Settings.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.buttonText}>⚙️ Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !url.trim() && styles.buttonDisabled]}
        onPress={handleStartAutomation}
        disabled={!url.trim()}
      >
        <Text style={styles.buttonText}>▶ Start Automation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  settingText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  noSettings: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  settingsButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
