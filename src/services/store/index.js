import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { usersApi } from "../api/usersApi";
import { appointmentsApi } from "../api/appointmentsApi";
import { staffsApi } from "../api/staffsApi";
import { servicesApi } from "../api/servicesApi";
import { serviceCategoriesApi } from "../api/serviceCategoriesApi";
import { reviewsApi } from "../api/reviewsApi";
import { stocksApi } from "../api/stocksApi";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [appointmentsApi.reducerPath]: appointmentsApi.reducer,
    [staffsApi.reducerPath]: staffsApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [serviceCategoriesApi.reducerPath]: serviceCategoriesApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [stocksApi.reducerPath]: stocksApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      appointmentsApi.middleware,
      staffsApi.middleware,
      servicesApi.middleware,
      serviceCategoriesApi.middleware,
      reviewsApi.middleware,
      stocksApi.middleware,
    ),
});

export default store;
