import { createBrowserRouter } from "react-router-dom";

import Login from "@/components/Login";
import Register from "@/components/Register";
import App from "./App";
import Chat from "@/components/Chat/mainLayout";
import ChatLayout from "./components/Chat/chatLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
  {
    element: <ChatLayout />,
    children: [
      {
        path: "/main",
        element: <Chat />,
      },
    ],
  },
]);

export default router;
