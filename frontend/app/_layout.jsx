import { Stack } from "expo-router";
import { Provider } from "react-redux";
import store, { persistor } from "../store";
import Toast from "react-native-toast-message";
import { PersistGate } from "redux-persist/integration/react";
import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { setNetworkStatus } from "../slices/networkSlice";
import OfflineBanner from "../components/OfflineBanner";

const AppShell = () => {
  const isConnected = useSelector((state) => state.network?.isConnected);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      store.dispatch(setNetworkStatus(state.isConnected ?? true));
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {!isConnected && <OfflineBanner />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" />
      </Stack>
      <Toast />
    </>
  );
};

const RootLayout = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppShell />
      </PersistGate>
    </Provider>
  );
};

export default RootLayout;
