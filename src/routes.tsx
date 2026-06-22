import AeroForensicsPage from './pages/AeroForensicsPage';
import CitizenAppPage from './pages/CitizenAppPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'AeroForensics AI',
    path: '/',
    element: <AeroForensicsPage />,
    public: true,
  },
  {
    name: 'Citizen e-Challan',
    path: '/citizen',
    element: <CitizenAppPage />,
    public: true,
  }
];
