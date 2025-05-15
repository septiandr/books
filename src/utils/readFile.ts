import RNBlobUtil from 'react-native-blob-util';

const booksDir = RNBlobUtil.fs.dirs.LegacySDCardDir + '/books';


async function ensureBooksFolderExists() {
  const exists = await RNBlobUtil.fs.exists(booksDir);
  if (!exists) {
    await RNBlobUtil.fs.mkdir(booksDir);
  }
}

// Daftar PDF dari folder
export async function listPdfFiles(): Promise<string[]> {
  const exists = await RNBlobUtil.fs.exists(booksDir);
  if (!exists) return [];

  const files = await RNBlobUtil.fs.ls(booksDir);
  return files.filter(f => f.endsWith('.pdf'));
}

export const loadFiles = async () => {
    await ensureBooksFolderExists();
    const files = await listPdfFiles();
    return files;
  };