/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { HomeScreenNavigationProp, PdfItem } from '../screen/Home';
import PDFThumbnail from './PdfThumbnail';
import RNBlobUtil from 'react-native-blob-util';

type PdfItemComponentProps = {
  item: PdfItem;
  thumbnailUri?: string;
  onThumbnailReady: (name: string, uri: string) => void;
  navigation: HomeScreenNavigationProp;
};

const PdfItemComponent = ({
  item,
  thumbnailUri,
  onThumbnailReady,
  navigation,
}: PdfItemComponentProps) => {
  const viewShotRef = useRef<any>(null);
  const [isPdfReady, setIsPdfReady] = useState(false);

  useEffect(() => {
    if (isPdfReady) {
      const captureAndSave = async () => {
        try {
          const uri = await viewShotRef.current?.capture();
          if (!uri) throw new Error('Failed to capture screenshot');

          const cleanUri = uri.replace('file://', '');
          const destPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${item.name}-${Date.now()}.jpg`;

          await RNBlobUtil.fs.cp(cleanUri, destPath);
          onThumbnailReady(item.name, destPath);
        } catch (error: any) {
          Alert.alert('Error', error.message);
        }
      };

      captureAndSave();
    }
  }, [isPdfReady]);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate('Viewer', { path: item.path, name: item.name });
      }}
    >
      {thumbnailUri ? (
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <PDFThumbnail
          ref={viewShotRef}
          path={item.path}
          onReady={() => setIsPdfReady(true)} // ✅ trigger state
        />
      )}
      <Text style={styles.label}>{item.name}</Text>
    </TouchableOpacity>
  );
};

export const MemoizedPdfItem = React.memo(PdfItemComponent);

const styles = StyleSheet.create({
  item: {
    width: '45%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  thumbnail: {
    width: 120,
    height: 160,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
  },
});
