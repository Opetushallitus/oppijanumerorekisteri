import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "./styles.css";

import { store } from "./store";
import { App } from "./App";

function main() {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }

  ReactDOM.createRoot(root).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

main();
