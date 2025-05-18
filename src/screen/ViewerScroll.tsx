import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const ViewerScreen = ({ route }: any) => {
  const { path } = route.params;

  // Encode local path into URI for WebView
  const localUri = `file:///android_asset/pdfjs/viewer.html?file=${encodeURIComponent('file://' + path)}`;

  const webViewRef = React.useRef<any>(null);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ uri: localUri }}
        style={{ flex: 1 }}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />

      {/* Floating Scroll Buttons */}
      <View style={styles.floating}>
        <TouchableOpacity style={styles.button} onPress={() => {
          webViewRef.current?.injectJavaScript(`window.scrollBy(0, -200); true;`);
        }}>
          <Text style={styles.buttonText}>▲</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {
          webViewRef.current?.injectJavaScript(`window.scrollBy(0, 200); true;`);
        }}>
          <Text style={styles.buttonText}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewerScreen;

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    right: 16,
    top: '40%',
    zIndex: 999,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 30,
    marginVertical: 8,
  },
  buttonText: { color: '#fff', fontSize: 20 },
});
