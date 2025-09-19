import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.jsx";
import Landing from "./pages/Landing.jsx";
import LoginJoin from "./pages/LoginJoin.jsx";
import Submit from "./pages/Submit.jsx";
import Standings from "./pages/Standings.jsx";
import Season from "./pages/Season.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: "login", element: <LoginJoin /> },
      { path: "submit", element: <Submit /> },
      { path: "standings", element: <Standings /> },
      { path: "season", element: <Season /> },
    ],
  },
]);

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const appRouter = <RouterProvider router={router} />;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {convexUrl ? (
      <ConvexProvider client={new ConvexReactClient(convexUrl)}>
        {appRouter}
      </ConvexProvider>
    ) : (
      appRouter
    )}
  </StrictMode>
);
