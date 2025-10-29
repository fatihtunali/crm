import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import HotelForm from './pages/HotelForm';
import HotelPricing from './pages/HotelPricing';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth.service';

// Placeholder pages - will be created shortly
const ResourcesPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Kaynaklar</h1>
  </div>
);

const VehiclesPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Araçlar</h1>
  </div>
);

const GuidesPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Rehberler</h1>
  </div>
);

const SuppliersPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Tedarikçiler</h1>
  </div>
);

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/hotels/new" element={<HotelForm />} />
          <Route path="/resources/hotels/:id/pricing" element={<HotelPricing />} />
          <Route path="/resources/hotels/:id/edit" element={<HotelForm />} />
          <Route path="/resources/hotels" element={<Hotels />} />
          <Route path="/resources/vehicles" element={<VehiclesPage />} />
          <Route path="/resources/guides" element={<GuidesPage />} />
          <Route path="/resources/suppliers" element={<SuppliersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
