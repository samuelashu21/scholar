import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  subcategories: [],
  productList: [],
  lastUpdatedAt: null,
};

const catalogCacheSlice = createSlice({
  name: "catalogCache",
  initialState,
  reducers: {
    cacheCatalogData: (state, action) => {
      const { categories, subcategories, productList } = action.payload;
      if (Array.isArray(categories)) state.categories = categories;
      if (Array.isArray(subcategories)) state.subcategories = subcategories;
      if (Array.isArray(productList)) state.productList = productList;
      state.lastUpdatedAt = new Date().toISOString();
    },
  },
});

export const { cacheCatalogData } = catalogCacheSlice.actions;
export default catalogCacheSlice.reducer;
