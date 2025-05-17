/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import Pdf from 'react-native-pdf';
import ViewShot from 'react-native-view-shot';

type Props = {
  path: string;
  onReady: (uri: string) => void;
};

const PDFThumbnailComponent = forwardRef<ViewShot, Props>(({ path, onReady }, ref) => {
  const [loading, setLoading] = useState(true);
  const viewShotRef = useRef<any>(null);

  // Optional: Expose internal ref if needed
  useImperativeHandle(ref, () => viewShotRef.current!);

  useEffect(() => {
    if (!loading && viewShotRef.current) {
      // Call capture manually once loading is done
      viewShotRef.current.capture().then((uri : any) => {
        onReady(uri);
      }).catch((err: any) => {
        console.warn('Capture failed:', err);
      });
    }
  }, [loading]);

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'jpg', quality: 0.5, result: 'tmpfile' }}
      style={styles.captureBox}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <Pdf
        source={{ uri: `file://${path}` }}
        page={1}
        scale={1}
        style={styles.pdf}
        onError={err => {
          console.warn('PDF load error:', err);
          setLoading(false);
        }}
        onLoadComplete={() => {
          setLoading(false);
        }}
      />
    </ViewShot>
  );
});

const PDFThumbnail = React.memo(PDFThumbnailComponent);
export default PDFThumbnail;

const styles = StyleSheet.create({
  captureBox: { width: 120, height: 160, backgroundColor: '#eee' },
  pdf: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});
