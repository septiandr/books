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

export type PdfItem = {
  name: string;
  path: string;
  thumbnail?: string;
};

type RootStackParamList = {
  Home: undefined;
  Viewer: { path: string; name: string };
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const [pdfList, setPdfList] = useState<PdfItem[]>([]);
  const [lastViewed, setLastViewed] = useState<PdfItem[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [name: string]: string }>({});
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // const loadData = async () => {
  //   await requestStoragePermission();
  //   const files = await loadFiles();

  //   const formatted = files.map(name => ({
  //     name: name.replace(/[-_+]/g, ' '),
  //     path: `/storage/emulated/0/books/${name}`,
  //   }));

  //   setPdfList(formatted);

  //   const lastViews = await getLastViews();

  //   const matchedLastViewed = lastViews
  //     .map((view: any) => formatted.find(item => item.path === view.path))
  //     .filter(Boolean) as PdfItem[];

  //   setLastViewed(matchedLastViewed);
  // };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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

  // Gunakan useFocusEffect agar loadData dipanggil saat screen fokus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const updateThumbnail = useCallback((name: string, uri: string) => {
    setThumbnails(prev => ({ ...prev, [name]: uri }));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PdfItem }) => (
      <MemoizedPdfItem
        item={item}
        thumbnailUri={thumbnails[item.name]}
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
          <View>
            {lastViewed.length > 0 && (
              <>
                <Text style={styles.title}>Last Viewed</Text>
                <FlatList
                  data={lastViewed}
                  keyExtractor={item => `last-${item.name}`}
                  numColumns={2}
                  scrollEnabled={false}
                  renderItem={renderItem}
                  contentContainerStyle={styles.grid}
                />
              </>
            )}
            <Text style={styles.title}>All PDFs</Text>
          </View>
        }
        data={otherPdfs}
        keyExtractor={item => item.name}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={[styles.grid, { paddingBottom: 60 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ marginTop: 20 }}>Belum ada file PDF</Text>
        }
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
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
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, marginLeft: 20 },
  grid: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
