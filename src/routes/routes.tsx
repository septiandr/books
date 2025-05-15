// routes.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screen/Home';
import ViewerScreen from '../screen/Viewer';

export type RootStackParamList = {
  Home: undefined;
  Viewer: { name: string; uri: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Daftar PDF' }} />
        <Stack.Screen name="Viewer" component={ViewerScreen} options={{ title: 'Lihat PDF' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
