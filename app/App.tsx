import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { ROUTES } from "./helpers/constants";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { logout, selectAuthAuthenticated } from "./redux/slices/authSlice";
import { persistor, store } from "./redux/store";
import ClientScreen from "./screens/ClientScreen";
import FiscalMonthScreen from "./screens/FiscalMonthScreen";
import LoginScreen from "./screens/LoginScreen";
import PortfolioScreen from "./screens/PortfolioScreen";
import { PersistGate } from "redux-persist/integration/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, Icon } from "@rneui/base";
import { Alert } from "react-native";

let AuthStack = createStackNavigator();
let HomeStack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Nav />
          </NavigationContainer>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

export function Nav() {
  const authenticated = useAppSelector(selectAuthAuthenticated);
  const dispatch = useAppDispatch();
  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout ?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {text: 'Logout', onPress: () => {
        dispatch(logout());
      }},
    ]);
  };
  return (
    <>
      {authenticated ? (
        <HomeStack.Navigator>
          <HomeStack.Screen
            name={ROUTES.PORTFOLIO}
            component={PortfolioScreen}
            options={{
              headerTitle: "Portfolio",
              headerRight: () => (
                <Button
                  icon={{ type: "feather", name: "power" }}
                  type="clear"
                  onPress={onLogout}
                />
              ),
            }}
          />
          <HomeStack.Screen name={ROUTES.CLIENT} component={ClientScreen} />
          <HomeStack.Screen
            name={ROUTES.FISCAL_MONTH}
            component={FiscalMonthScreen}
          />
        </HomeStack.Navigator>
      ) : (
        <AuthStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <HomeStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </>
  );
}
