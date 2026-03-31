import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import AdminPage from "@/pages/AdminPage";
import CertificatePage from "@/pages/CertificatePage";
import DonationsPage from "@/pages/DonationsPage";
import HomePage from "@/pages/HomePage";
import JobsPage from "@/pages/JobsPage";
import MasjidPage from "@/pages/MasjidPage";
import MasjidRegisterPage from "@/pages/MasjidRegisterPage";
import MatrimonyPage from "@/pages/MatrimonyPage";
import RegisterPage from "@/pages/RegisterPage";
import ZakatPage from "@/pages/ZakatPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Toaster position="top-right" />
      <Outlet />
    </>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});
const registerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/register",
  component: RegisterPage,
});
const matrimonyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/matrimony",
  component: MatrimonyPage,
});
const jobsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/jobs",
  component: JobsPage,
});
const donationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/donations",
  component: DonationsPage,
});
const certificateRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/certificate/$id",
  component: CertificatePage,
});
const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminPage,
});
const masjidRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/masjid",
  component: MasjidPage,
});
const zakatRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/zakat",
  component: ZakatPage,
});
const masjidRegisterRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/masjid-register",
  component: MasjidRegisterPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    registerRoute,
    matrimonyRoute,
    jobsRoute,
    donationsRoute,
    certificateRoute,
    adminRoute,
    masjidRoute,
    zakatRoute,
    masjidRegisterRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
