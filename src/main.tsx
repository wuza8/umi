import ReactDOM from "react-dom/client";
import {Program} from "./App";
import { StateProvider } from "./context";
import React from "react";
import './i18n';


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  //<React.StrictMode>
    <StateProvider>
      <Program />
    </StateProvider>
  //</React.StrictMode>,
);
