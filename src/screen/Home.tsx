/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { requestStoragePermission } from '../utils/permission';
import { loadFiles } from '../utils/readFile';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MemoizedPdfItem } from '../components/PdfItemComponent';
import { getLastViews } from '../utils/savelastView';
import { RootStackParamList } from '../routes/routes';

export type PdfItem = {
  name: string;
  path: string;
  thumbnail?: string;
};


export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const [pdfList, setPdfList] = useState<PdfItem[]>([]);
  const [lastViewed, setLastViewed] = useState<PdfItem[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [path: string]: string }>({});
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    await requestStoragePermission();
    const files = await loadFiles();

    const formatted = files.map(name => ({
      name: name.replace(/[-_+]/g, ' '),
      path: `/storage/emulated/0/books/${name}`,
    }));

    setPdfList(formatted);

    const lastViews = await getLastViews();
    const matchedLastViewed = lastViews
      .map((view: any) => formatted.find(item => item.path === view.path))
      .filter(Boolean) as PdfItem[];

    setLastViewed(matchedLastViewed);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const updateThumbnail = useCallback((path: string, uri: string) => {
    setThumbnails(prev => ({ ...prev, [path]: uri }));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PdfItem }) => (
      <MemoizedPdfItem
        item={item}
        thumbnailUri={thumbnails[item.path]}
        onThumbnailReady={updateThumbnail}
        navigation={navigation}
      />
    ),
    [thumbnails, updateThumbnail, navigation],
  );

  const otherPdfs = pdfList.filter(
    item => !lastViewed.find(lv => lv.path === item.path),
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {lastViewed.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.title}>📌 Last Viewed</Text>
                <FlatList
                  data={lastViewed}
                  keyExtractor={item => `last-${item.path}`}
                  numColumns={2}
                  scrollEnabled={false}
                  renderItem={renderItem}
                  contentContainerStyle={styles.grid}
                />
              </View>
            )}
            <Text style={styles.title}>📚 All PDFs ({otherPdfs.length})</Text>
          </View>
        }
        data={otherPdfs}
        keyExtractor={item => item.path}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={[styles.grid, { paddingBottom: 80 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada file PDF</Text>
        }
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={(_, index) => ({
          length: 200,
          offset: 200 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  headerSection: { paddingHorizontal: 20, paddingTop: 10 },
  section: { marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  grid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
});
