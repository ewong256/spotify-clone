import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import configureStore from "./redux/store";
import { router } from "./router";
import * as sessionActions from "./redux/session";
import "./index.css";

// Initialize the store
const store = configureStore();

// App component
const App = () => {
  const dispatch = useDispatch(); // Get dispatch from Redux

  useEffect(() => {
    // Dispatching thunkAuthenticate inside the component
    dispatch(sessionActions.thunkAuthenticate());
  }, [dispatch]); // Add dispatch to dependencies to avoid unnecessary rerenders

  return (
    <React.StrictMode>
      <ReduxProvider store={store}>
        <RouterProvider router={router} />
      </ReduxProvider>
    </React.StrictMode>
  );
};

if (import.meta.env.MODE !== "production") {
  window.store = store;
  window.sessionActions = sessionActions;
}

// Render the App component
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
