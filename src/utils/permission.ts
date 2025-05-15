import {request, PERMISSIONS} from 'react-native-permissions';
import {PermissionsAndroid, Linking, Platform} from 'react-native';

export async function requestStoragePermission() {
  await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  await requestManageExternalStoragePermission();
}

async function requestManageExternalStoragePermission() {
  if (Platform.OS === 'android' && Platform.Version >= 30) {
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.MANAGE_EXTERNAL_STORAGE' as any,
      );

      if (
        granted === PermissionsAndroid.RESULTS.GRANTED ||
        granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      ) {
        console.log('Permission granted!');
      } else {
        console.log('Permission denied. Redirecting to settings...');
        Linking.openSettings();
      }
    } catch (err) {
      console.warn(err);
    }
  }
}
