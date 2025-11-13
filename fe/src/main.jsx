import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Tailwind CSS
import "./index.css";
import 'antd/dist/reset.css'; // Hoặc 'antd/dist/antd.css' nếu version cũ

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
