import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import Pdf from 'react-native-pdf';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import { getLastViewByPath, saveLastView } from '../utils/savelastView';

export default function Viewer() {
  const route = useRoute<RouteProp<Record<string, { path: string }>, string>>();
  const { path } = route.params;
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paging, setPaging] = useState(true);

  // Ambil halaman terakhir saat mount
  useEffect(() => {
    (async () => {
      const lastPage = await getLastViewByPath(path);
      if (lastPage) {
        setPage(lastPage);
      }
    })();
  }, [path]);
  

  const goToPage = (direction: 'up' | 'down') => {
    setPaging(true);
    setPage(prev =>
      direction === 'up' ? Math.max(1, prev - 1) : Math.min(totalPages, prev + 1)
    );
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <View style={styles.pdfWrapper}>
        <Pdf
          source={{ uri: `file://${path}` }}
          style={styles.pdf}
          enablePaging={paging}
          horizontal={false}
          fitPolicy={2}
          page={paging ? page : undefined}
          onPageChanged={(newPage, numberOfPages) => {
            setTotalPages(numberOfPages);
            setLoading(false);
            setPage(newPage);
            saveLastView(path, newPage); // Simpan halaman terakhir
          }}
        />
      </View>

      <Text style={styles.page}>
        {page}/{totalPages}
      </Text>

      {totalPages > 0 && (
        <View style={styles.rightControls}>
          <TouchableOpacity onPress={() => goToPage('up')} style={styles.arrowButton}>
            <Text style={styles.arrowText}>⬆️</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.arrowButton, styles.backButton]}>
            <Text style={styles.arrowText}>🔙</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => goToPage('down')} style={styles.arrowButton}>
            <Text style={styles.arrowText}>⬇️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#4a4a4a4a'},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pdfWrapper: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center', // center horizontally
  },
  pdf: {
    width: screen.width * 1,
    height: screen.width * 0.9 * 1.5, // A4 ratio: width * sqrt(2)
  },
  rightControls: {
    position: 'absolute',
    right: 10,
    top: '35%',
    borderRadius: 8,
    padding: 5,
    gap: 10,
  },
  arrowButton: {
    padding: 8,
    backgroundColor: '#4a4a4a4a',
    borderRadius: 8,
    opacity: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#4a4a4a4a',
  },
  arrowText: {
    fontSize: 24,
    color: '#333',
  },
  page: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#4a4a4a4a',
    padding: 8,
    borderRadius: 8,
    opacity: 0.6,
  },
});
