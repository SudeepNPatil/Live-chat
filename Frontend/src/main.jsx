import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Components/Home.jsx';
import { Chat } from './Components/Chat.jsx';
import Video from './Components/Video.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'Home',
        element: <Home />,
      },
      {
        path: 'chat/:roomId',
        element: <Chat />,
      },
        {
        path: 'video/:roomId',
        element: <Video />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
