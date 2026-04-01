import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [targetTag, setTargetTag] = useState('');
  const [reloadOnError, setReloadOnError] = useState(false);
  const [handleDynamicContent, setHandleDynamicContent] = useState(false);
  const [timeout, setTimeout] = useState('9');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('automationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setTargetTag(parsed.targetTag || '');
        setReloadOnError(parsed.reloadOnError || false);
        setHandleDynamicContent(parsed.handleDynamicContent || false);
        setTimeout(parsed.timeout?.toString() || '9');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!targetTag.trim()) {
      Alert.alert('Error', 'Please enter a target tag (e.g., div, button, a)');
      return;
    }

    try {
      const settings = {
        targetTag: targetTag.trim(),
        reloadOnError,
        handleDynamicContent,
        timeout: parseInt(timeout) || 9,
      };

      await AsyncStorage.setItem('automationSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Element Settings</Text>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Target Tag/Selector</Text>
          <Text style={styles.description}>
            Enter the CSS selector or HTML tag to click (e.g., button, .button-class, #button-id, div[data-id="123"])
          </Text>
          <TextInput
            style={styles.input}
            placeholder='e.g., button, div, a, .my-button, #click-me'
            placeholderTextColor="#999"
            value={targetTag}
            onChangeText={setTargetTag}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.label}>Timeout (seconds)</Text>
          <Text style={styles.description}>
            Time before returning to main page after clicking
          </Text>
          <TextInput
            style={styles.input}
            placeholder="9"
            placeholderTextColor="#999"
            value={timeout}
            onChangeText={setTimeout}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Options</Text>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.label}>Reload on Error</Text>
            <Text style={styles.description}>
              Automatically reload the page if element is not found
            </Text>
          </View>
          <Switch
            value={reloadOnError}
            onValueChange={setReloadOnError}
            trackColor={{ false: '#767577', true: '#81c784' }}
            thumbColor={reloadOnError ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Text style={styles.label}>Handle Dynamic Content</Text>
            <Text style={styles.description}>
              Wait for JavaScript to load dynamic content before clicking
            </Text>
          </View>
          <Switch
            value={handleDynamicContent}
            onValueChange={setHandleDynamicContent}
            trackColor={{ false: '#767577', true: '#81c784' }}
            thumbColor={handleDynamicContent ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Selectors</Text>
        <Text style={styles.example}>• button - Click any button</Text>
        <Text style={styles.example}>• a - Click any link</Text>
        <Text style={styles.example}>• div.ads - Click div with class "ads"</Text>
        <Text style={styles.example}>• #submit - Click element with id "submit"</Text>
        <Text style={styles.example}>• button[type="submit"] - Click submit button</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>💾 Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={loadSettings}>
        <Text style={styles.resetButtonText}>↻ Reset to Saved</Text>
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
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  settingItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  switchLabel: {
    flex: 1,
    marginRight: 10,
  },
  example: {
    fontSize: 13,
    color: '#666',
    marginVertical: 5,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
