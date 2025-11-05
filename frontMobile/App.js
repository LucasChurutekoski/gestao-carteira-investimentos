import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/Login';
import HomeScreen from './screens/Home';
import CriarConta from './screens/CriarConta';

const Stack = createNativeStackNavigator()

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "tela de login"
        }}
      />
      <Stack.Screen
        name='Home'
        component={HomeScreen}
        options={{
          title: 'Tela Inicial'
        }}
      />
      <Stack.Screen
        name='CriarConta'
        component={CriarConta}
        options={{
          title : "Criar Conta"
        }}
      />
      <Stack.Screen
        name='novaTransacaoModal'
        component={TransacaoModal}
        options={{
          title : "Realizar uma transação",
          presentation : "modal"
        }}
      />
    </Stack.Navigator>
  )
}


export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
