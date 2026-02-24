import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/Cashier/DashboardScreen';
import MenuManagerScreen from '../screens/Cashier/MenuManagerScreen';
import MenuFormScreen from '../screens/Cashier/MenuFormScreen';
import ReadyOrdersScreen from '../screens/Cashier/ReadyOrdersScreen';
import ReleaseTableScreen from '../screens/Cashier/ReleaseTableScreen';
import TablesManagerScreen from '../screens/Cashier/TablesManagerScreen';

export type CashierStackParamList = {
  Dashboard: undefined;
  MenuManager: undefined;
  MenuForm: { menuId?: string };
  ReadyOrders: undefined;
  ReleaseTable: undefined;
  TablesManager: undefined;
};

const Stack = createNativeStackNavigator<CashierStackParamList>();

export default function CashierNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Caissière' }}
      />
      <Stack.Screen
        name="MenuManager"
        component={MenuManagerScreen}
        options={{ title: 'Gestion des menus' }}
      />
      <Stack.Screen
        name="MenuForm"
        component={MenuFormScreen}
        options={({ route }) => ({
          title: route.params?.menuId ? 'Modifier le menu' : 'Nouveau menu',
        })}
      />
      <Stack.Screen
        name="ReadyOrders"
        component={ReadyOrdersScreen}
        options={{ title: 'Plats prêts' }}
      />
      <Stack.Screen
        name="ReleaseTable"
        component={ReleaseTableScreen}
        options={{ title: 'Libérer une table' }}
      />
      <Stack.Screen
        name="TablesManager"
        component={TablesManagerScreen}
        options={{ title: 'Gestion des tables' }}
      />
    </Stack.Navigator>
  );
}
