import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function BrowserScreen({ route, navigation }) {
  const { targetUrl, settings } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(9);
  const [automationStarted, setAutomationStarted] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    if (automationStarted) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            handleAutomationComplete();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [automationStarted]);

  const handleWebViewLoaded = () => {
    setIsLoading(false);
    if (!automationStarted) {
      performAutomation();
    }
  };

  const performAutomation = async () => {
    setAutomationStarted(true);

    if (!settings) {
      Alert.alert('Error', 'No settings configured. Please go back and set up settings.');
      return;
    }

    const { targetTag, reloadOnError, handleDynamicContent } = settings;

    const automationScript = `
      (async function() {
        try {
          ${handleDynamicContent ? `
            await new Promise(resolve => setTimeout(resolve, 2000));
          ` : ''}

          let element = document.querySelector('${targetTag}');
          
          if (!element) {
            const elements = document.querySelectorAll('${targetTag}');
            if (elements.length > 0) {
              element = elements[0];
            }
          }

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            element.click();
            
            const event = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            element.dispatchEvent(event);
            
            window.ReactNativeWebView.postMessage('success');
          } else {
            ${reloadOnError ? `
              window.location.reload();
              window.ReactNativeWebView.postMessage('reload');
            ` : `
              window.ReactNativeWebView.postMessage('element_not_found');
            `}
          }
        } catch (error) {
          ${reloadOnError ? `
            window.location.reload();
            window.ReactNativeWebView.postMessage('error');
          ` : `
            window.ReactNativeWebView.postMessage('error');
          `}
        }
      })();
      true;
    `;

    webViewRef.current?.injectJavaScript(automationScript);
  };

  const handleAutomationComplete = () => {
    Alert.alert(
      'Automation Complete',
      'The automation has finished. The page will close now.',
      [
        {
          text: 'Close',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('WebView message:', message);
    
    if (message === 'success') {
      Alert.alert('Success', 'Element clicked successfully!');
    } else if (message === 'element_not_found') {
      Alert.alert('Warning', 'Target element not found on the page.');
    } else if (message === 'error') {
      Alert.alert('Error', 'An error occurred during automation.');
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  const handleStop = () => {
    navigation.goBack();
  };

  const formatUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.controlButton} onPress={handleReload}>
          <Text style={styles.controlButtonText}>🔄 Reload</Text>
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>⏱️ {timer}s</Text>
        </View>
        <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={handleStop}>
          <Text style={styles.controlButtonText}>✕ Stop</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: formatUrl(targetUrl) }}
        style={styles.webview}
        onLoadEnd={handleWebViewLoaded}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        originWhitelist={['*']}
        onError={(error) => {
          console.error('WebView error:', error);
          Alert.alert('Error', 'Failed to load the website. Please check the URL.');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 5,
  },
  controlButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  stopButton: {
    backgroundColor: '#d32f2f',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
