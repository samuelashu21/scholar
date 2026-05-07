import { useEffect, useRef, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Hook that tracks network connectivity.
 * Returns { isConnected, isInternetReachable }.
 * Also calls onReconnect callback when connectivity is restored.
 */
export const useNetworkStatus = (onReconnect) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? false;

      setIsConnected(connected);
      setIsInternetReachable(reachable);

      // If we were offline and are now back online, call the callback
      if (wasOfflineRef.current && connected && reachable) {
        wasOfflineRef.current = false;
        if (typeof onReconnect === "function") {
          onReconnect();
        }
      }

      if (!connected || !reachable) {
        wasOfflineRef.current = true;
      }
    });

    return () => unsubscribe();
  }, [onReconnect]);

  return { isConnected, isInternetReachable };
};
