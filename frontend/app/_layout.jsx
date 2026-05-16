import { Stack } from "expo-router";
import { Provider } from "react-redux";
import store, { persistor } from "../store";
import Toast from "react-native-toast-message";
import { PersistGate } from "redux-persist/integration/react";
import AppErrorBoundary from "../components/AppErrorBoundary";

const RootLayout = () => {
  return (
    <AppErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Stack screenOptions={{ headerShown: false }}>
            
            {/* ✅ WELCOME / ENTRY SCREEN */}
            <Stack.Screen name="index" />

            {/* MAIN APP */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(screens)" />

          </Stack>
          <Toast />
        </PersistGate>
      </Provider>
    </AppErrorBoundary>
  );
};

export default RootLayout; 