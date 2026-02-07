import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersListScreen from '../screens/Chef/OrdersListScreen';
import OrderDetailScreen from '../screens/Chef/OrderDetailScreen';

export type ChefStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<ChefStackParamList>();

export default function ChefNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: 'Commandes' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Détail commande' }}
      />
    </Stack.Navigator>
  );
}
