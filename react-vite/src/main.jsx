import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";  // Import Provider
import { RouterProvider } from "react-router-dom";
import configureStore from "./redux/store";
import { router } from "./router";
import * as sessionActions from "./redux/session";
import "./index.css";

// Initialize the store
const store = configureStore();

// Wrap in a React component
const App = () => {
  useEffect(() => {
    // Dispatching thunkAuthenticate inside the component
    store.dispatch(sessionActions.thunkAuthenticate());
  }, []);

  return (
    <React.StrictMode>
      <ReduxProvider store={store}> {/* Wrap with ReduxProvider */}
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
