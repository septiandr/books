// routes.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screen/Home';
import ViewerScreen from '../screen/Viewer';
import { default as ViewerScroll } from '../screen/ViewerScroll';

export type RootStackParamList = {
  Home: undefined;
  Viewer: { name: string; path: string };
  ViewerScroll: { name: string; path: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Daftar PDF' }} />
        <Stack.Screen name="Viewer" component={ViewerScreen} options={{ title: 'Lihat PDF' }} />
        <Stack.Screen 
          name="ViewerScroll" 
          component={ViewerScroll as React.ComponentType<any>}
          options={{ title: 'Lihat PDF' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
