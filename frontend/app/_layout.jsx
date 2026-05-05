import { Stack } from "expo-router";
import { Provider } from "react-redux";
import store, { persistor } from "../store";
import Toast from "react-native-toast-message";
import { PersistGate } from "redux-persist/integration/react";
import "../i18n"; // Initialize i18next
import OfflineBanner from "../components/OfflineBanner";

const RootLayout = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }}>
          
          {/* ✅ WELCOME / ENTRY SCREEN */}
          <Stack.Screen name="index" />

          {/* MAIN APP */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(screens)" />

        </Stack>
        <OfflineBanner />
        <Toast />
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
