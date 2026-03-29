import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, ProgressBar } from 'react-native-paper';
import io from 'socket.io-client';
import { StyleSheet } from 'react-native';

const DownloadScreen = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadId, setDownloadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const socket = io('http://localhost:3000');

  socket.on('download_update', (data) => {
    if (data.id === downloadId) {
      setStatus(data.status);
      setProgress(data.progress / 100);
      if (data.status === 'complete') {
        Alert.alert('Success', `Download complete: ${data.file}`);
      } else if (data.status === 'error') {
        Alert.alert('Error', data.error);
      }
    }
  });

  const startDownload = async () => {
    setLoading(true);
    setStatus('starting');
    try {
      const response = await fetch('http://localhost:3000/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (result.id) {
        setDownloadId(result.id);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>VidoSaver</Title>
          <TextInput
            label="Video URL"
            value={url}
            onChangeText={setUrl}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={startDownload} loading={loading} disabled={!url} style={styles.button}>
            Download
          </Button>
          {status && (
            <>
              <Paragraph>Status: {status}</Paragraph>
              {progress > 0 && <ProgressBar progress={progress} />}
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  card: { padding: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 10 },
});

export default DownloadScreen;

