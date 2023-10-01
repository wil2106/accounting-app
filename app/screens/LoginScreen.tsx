import { Button, Input, Text } from "@rneui/base";
import { Image } from "expo-image";
import { createRef, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View
} from "react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  autoLogin,
  login,
  selectAuthErrorMessage,
  selectAuthStatus,
} from "../redux/slices/authSlice";

export default function LoginScreen() {
  const passwordInput = createRef<any>();

  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const errorMessage = useAppSelector(selectAuthErrorMessage);

  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const onChangeText = (id: string, text: string) => {
    setState((prevState) => ({ ...prevState, [id]: text }));
  };

  const onLogin = () => {
    const formattedEmail = state.email.trim();
    const formattedPassword = state.password.trim();
    if (formattedEmail.length === 0 || formattedPassword.length === 0){
      return;
    }
    dispatch(login({email: formattedEmail, password: formattedPassword}));
  };

  useEffect(() => {
    dispatch(autoLogin());
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: 15 }}
        >
          <Image
            source={require("../assets/dougs-logo.png")}
            contentFit="contain"
            transition={2000}
            style={{
              alignSelf: "center",
              resizeMode: "contain",
              width: 200,
              aspectRatio: 101 / 26,
              marginBottom: 50,
            }}
          />
          <Input
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={{ type: "feather", name: "mail" }}
            onChangeText={(text) => onChangeText("email", text)}
            onSubmitEditing={() => passwordInput.current.focus()}
            returnKeyType="next"
            keyboardType="email-address"
          />
          <Input
            ref={passwordInput}
            placeholder="Password"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={{ type: "feather", name: "lock" }}
            onChangeText={(text) => onChangeText("password", text)}
            onSubmitEditing={onLogin}
            returnKeyType="send"
            secureTextEntry
          />
          {status === "failed" && errorMessage !== null && (
            <Text
              style={{
                alignSelf: "center",
                color: "rgba(199, 43, 98, 1)",
                fontWeight: "500",
              }}
            >
              {errorMessage}
            </Text>
          )}
          <View
            style={{
              position: "absolute",
              bottom: 15,
              paddingHorizontal: 15,
              left: 0,
              right: 0,
            }}
          >
            <Button title="Login" onPress={onLogin} loading={status === "loading"} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
