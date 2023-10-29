import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Button } from "@rneui/base";
import { StatusBar } from "expo-status-bar";
import { Alert, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ROUTES } from "./helpers/constants";
import utils from "./helpers/utils";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { authSliceActions, logout, selectAuthAuthenticated } from "./redux/slices/authSlice";
import { persistor, store } from "./redux/store";
import ClientScreen from "./screens/ClientScreen";
import FiscalMonthScreen from "./screens/FiscalMonthScreen";
import LoginScreen from "./screens/LoginScreen";
import PortfolioScreen from "./screens/PortfolioScreen";
import { AuthStackParamList, HomeStackParamList } from "./types";
import BankOperation from "./screens/BankOperation";
import { registerCustomIconType } from "@rneui/base";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
registerCustomIconType('material-community-icons', MaterialCommunityIcons);

let AuthStack = createStackNavigator<AuthStackParamList>();
let HomeStack = createStackNavigator<HomeStackParamList>();

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
    Alert.alert("Logout", "Are you sure you want to logout ?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          dispatch(authSliceActions.logout());
        },
      },
    ]);
  };
  return (
    <>
      {authenticated ? (
        <HomeStack.Navigator
          screenOptions={({ navigation }) => {
            return {
              headerLeft: () => (
                <Button
                  icon={{ type: "feather", name: "chevron-left" }}
                  type="clear"
                  onPress={() => navigation.goBack()}
                />
              ),
            };
          }}
        >
          <HomeStack.Screen
            name={ROUTES.PORTFOLIO as any}
            component={PortfolioScreen}
            options={({ navigation }) => {
              return {
                headerTitle: "Portfolio",
                headerRight: () => (
                  <Button
                    icon={{ type: "feather", name: "power" }}
                    type="clear"
                    onPress={onLogout}
                  />
                ),
                headerLeft: () => <></>,
              };
            }}
          />
          <HomeStack.Screen
            name={ROUTES.CLIENT as any}
            component={ClientScreen}
            options={({ route }) => ({
              title:
                `${route.params.client?.name} fiscal months` ?? "Fiscal Months",
            })}
          />
          <HomeStack.Screen
            name={ROUTES.FISCAL_MONTH as any}
            component={FiscalMonthScreen}
            options={({ route }) => {
              let title = "Operations";
              if (route.params.fiscalMonth?.date) {
                title = `${utils.getMonthYearStringFromDateString(
                  route.params.fiscalMonth.date
                )} operations`;
              }
              return {
                title,
                headerRight: () => (
                  <Button
                    icon={{
                      type: "feather",
                      name: "file-text",
                      color: route.params.fiscalMonth?.controlBankStatementUrl ? "black" : "lightgrey"
                    }}
                    type="clear"
                    onPress={() => {
                      if (!route.params.fiscalMonth?.controlBankStatementUrl){
                        return;
                      }
                      Linking.openURL(route.params.fiscalMonth.controlBankStatementUrl);
                    }}
                  />
                ),
              };
            }}
          />
          <HomeStack.Screen
            name={ROUTES.BANK_OPERATION as any}
            component={BankOperation}
            options={({ route }) => ({
              title: route.params?.bankOperation
                ? `Edit bank operation #${route.params.bankOperation.id}`
                : "Create bank operation",
              presentation: "modal",
              headerLeft: () => <></>,
            })}
          />
        </HomeStack.Navigator>
      ) : (
        <AuthStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <HomeStack.Screen
            name={ROUTES.LOGIN as any}
            component={LoginScreen}
          />
        </AuthStack.Navigator>
      )}
    </>
  );
}
