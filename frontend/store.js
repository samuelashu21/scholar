import { configureStore,combineReducers } from "@reduxjs/toolkit";
import { persistStore,persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

  
import { apiSlice } from "./slices/apiSlice";
import cartSliceReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import networkReducer from "./slices/networkSlice";
import catalogCacheReducer from "./slices/catalogCacheSlice";
 

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "cart", "catalogCache", "network"],
}; 

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  cart: cartSliceReducer,
  network: networkReducer,
  catalogCache: catalogCacheReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
 

const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER", 
        ],
      },
    }).concat(apiSlice.middleware),
  devTools: true,
}); 
 
export const persistor = persistStore(store);
 
export default store;
