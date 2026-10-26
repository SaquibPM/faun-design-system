import type { RouteObject } from "react-router";
import { Shell } from "./components/Shell";
import { ComponentPage } from "./pages/ComponentPage";
import { ComponentsIndex } from "./pages/ComponentsIndex";
import { FoundationsIndex } from "./pages/FoundationsIndex";
import { FoundationPage } from "./pages/FoundationPage";
import { GuidePage } from "./pages/GuidePage";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { PatternPage } from "./pages/PatternPage";
import { PatternsIndex } from "./pages/PatternsIndex";

export const routes: RouteObject[] = [
  {
    element: <Shell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/guides/:slug", element: <GuidePage /> },
      { path: "/foundations", element: <FoundationsIndex /> },
      { path: "/foundations/:slug", element: <FoundationPage /> },
      { path: "/foundations/:slug/:tab", element: <FoundationPage /> },
      { path: "/components", element: <ComponentsIndex /> },
      { path: "/components/:slug", element: <ComponentPage /> },
      { path: "/components/:slug/:tab", element: <ComponentPage /> },
      { path: "/patterns", element: <PatternsIndex /> },
      { path: "/patterns/:slug", element: <PatternPage /> },
      { path: "/patterns/:slug/:tab", element: <PatternPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
