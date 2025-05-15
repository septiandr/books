import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_VIEW_INDEX_KEY = 'lastView:index';
const MAX_HISTORY = 2;

export const saveLastView = async (path: string, page: number) => {
  try {
    const entry = {
      path,
      page,
      timestamp: Date.now(),
    };

    // Simpan detailnya
    await AsyncStorage.setItem(`lastView:${path}`, JSON.stringify(entry));

    // Ambil index
    const indexRaw = await AsyncStorage.getItem(LAST_VIEW_INDEX_KEY);
    let index = indexRaw ? JSON.parse(indexRaw) : [];

    // Hapus path kalau sudah ada, lalu masukkan ke awal
    index = index.filter((item: string) => item !== path);
    index.unshift(path);

    // Batasi jumlah
    if (index.length > MAX_HISTORY) {
      const removed = index.slice(MAX_HISTORY);
      // Opsional: hapus data lama
      await Promise.all(
        removed.map((p: string) => AsyncStorage.removeItem(`lastView:${p}`))
      );
      index = index.slice(0, MAX_HISTORY);
    }

    await AsyncStorage.setItem(LAST_VIEW_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error('Failed to save last view:', error);
  }
};

export const getLastViews = async () => {
  try {
    const indexRaw = await AsyncStorage.getItem(LAST_VIEW_INDEX_KEY);
    const index = indexRaw ? JSON.parse(indexRaw) : [];

    const items = await Promise.all(
      index.map((path: string) =>
        AsyncStorage.getItem(`lastView:${path}`).then(data =>
          data ? JSON.parse(data) : null
        )
      )
    );

    return items.filter(Boolean); // Hapus null jika ada
  } catch (error) {
    console.error('Failed to load last views:', error);
    return [];
  }
};

export const getLastViewByPath = async (path: string): Promise<number | null> => {
    try {
      const json = await AsyncStorage.getItem(`lastView:${path}`);
      if (!json) return null;
  
      const data = JSON.parse(json);
      return data.page ?? null;
    } catch (error) {
      console.error('Failed to load last view by path:', error);
      return null;
    }
  };
  