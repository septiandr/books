import React, { useRef} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {HomeScreenNavigationProp, PdfItem} from '../screen/Home';
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

  const waitForFile = async (path: string, timeout = 3000) => {
    const interval = 100;
    const maxTries = timeout / interval;
    let tries = 0;

    while (tries < maxTries) {
      const exists = await RNBlobUtil.fs.exists(path);
      if (exists) return true;
      await new Promise(res => setTimeout(res, interval));
      tries++;
    }

    return false;
  };

  const cleanFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_');
  };

  const getThumbnailFolder = async () => {
    const dir = RNBlobUtil.fs.dirs.DocumentDir + '/thumbnail';
    const exists = await RNBlobUtil.fs.exists(dir);
    if (!exists) {
      await RNBlobUtil.fs.mkdir(dir);
    }
    return dir;
  };
  
  const cleanOldThumbnails = async () => {
    const dir = await getThumbnailFolder();
    try {
      const files = await RNBlobUtil.fs.ls(dir);
      const now = Date.now();
      for (const file of files) {
        if (file.endsWith('.jpg')) {
          const stat = await RNBlobUtil.fs.stat(`${dir}/${file}`);
          const age = now - new Date(stat.lastModified).getTime();
          if (age > 3 * 24 * 60 * 60 * 1000) {
            await RNBlobUtil.fs.unlink(`${dir}/${file}`);
          }
        }
      }
    } catch (err: any) {
      console.log('❌ Error cleaning old thumbnails:', err.message);
    }
  };
  
  const getThumbnailFilePath = async (baseName: string, ext = '.jpg') => {
    const dir = await getThumbnailFolder();
    const fileName = `${baseName}${ext}`;
    const filePath = `${dir}/${fileName}`;
  
    const exists = await RNBlobUtil.fs.exists(filePath);
    if (exists) {
      return filePath;
    }
    return filePath;
  };
  

  const handleThumbnailReady = async (uri: string) => {
    try {
      await cleanOldThumbnails(); // Optional bersihkan thumbnail lama

      const cleanUri = uri.replace('file://', '');
      const safeName = cleanFileName(item.name);

      // Dapatkan path file thumbnail yang ada/baru
      const destPath = await getThumbnailFilePath(safeName);

      const exists = await waitForFile(cleanUri);
      if (!exists) throw new Error('Captured file not found after waiting');

      // Cek apakah file thumbnail sudah ada
      const destExists = await RNBlobUtil.fs.exists(destPath);
      if (!destExists) {
        // Kalau belum ada, tulis file baru
        const imageData = await RNBlobUtil.fs.readFile(cleanUri, 'base64');
        await RNBlobUtil.fs.writeFile(destPath, imageData, 'base64');
        console.log('✅ New thumbnail saved:', destPath);
      } else {
        console.log('ℹ️ Thumbnail already exists, using:', destPath);
      }

      onThumbnailReady(item.name, destPath);
    } catch (error: any) {
      console.error('❌ Error saving thumbnail:', error.message);
    }
  };

  console.log(thumbnailUri)
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate('Viewer', {path: item.path, name: item.name});
      }}>
      {thumbnailUri ? (
        <Image
          source={{uri: `file://${thumbnailUri}`}}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <PDFThumbnail
          ref={viewShotRef}
          path={item.path}
          onReady={handleThumbnailReady}
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
