import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TableSelectScreen from '../screens/Client/TableSelectScreen';
import MenuScreen from '../screens/Client/MenuScreen';
import OrderStatusScreen from '../screens/Client/OrderStatusScreen';
import OrderReadyNotifier from '../components/client/OrderReadyNotifier';

export type ClientStackParamList = {
  TableSelect: undefined;
  Menu: undefined;
  OrderStatus: undefined;
};

const Stack = createNativeStackNavigator<ClientStackParamList>();

export default function ClientNavigator() {
  return (
    <>
      <OrderReadyNotifier />
      <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="TableSelect"
        component={TableSelectScreen}
        options={{ title: 'Votre table' }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: 'Menu' }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatusScreen}
        options={{ title: 'Ma commande' }}
      />
    </Stack.Navigator>
    </>
  );
}
