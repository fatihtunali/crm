import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import HotelForm from './pages/HotelForm';
import HotelPricing from './pages/HotelPricing';
import VehicleSuppliers from './pages/VehicleSuppliers';
import VehicleSupplierForm from './pages/VehicleSupplierForm';
import VehiclePricing from './pages/VehiclePricing';
import Guides from './pages/Guides';
import GuideForm from './pages/GuideForm';
import GuidePricing from './pages/GuidePricing';
import Suppliers from './pages/Suppliers';
import SupplierForm from './pages/SupplierForm';
import EntranceFeePricing from './pages/EntranceFeePricing';
import SupplierServicePricing from './pages/SupplierServicePricing';
import AllEntranceFees from './pages/AllEntranceFees';
import EntranceFeeForm from './pages/EntranceFeeForm';
import Customers from './pages/Customers';
import Agents from './pages/Agents';
import AgentForm from './pages/AgentForm';
import AgentDetail from './pages/AgentDetail';
import DirectClients from './pages/DirectClients';
import ClientForm from './pages/ClientForm';
import Reservations from './pages/Reservations';
import ReservationForm from './pages/ReservationForm';
import ReservationDetail from './pages/ReservationDetail';
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
          <Route path="/resources/vehicle-suppliers/new" element={<VehicleSupplierForm />} />
          <Route path="/resources/vehicle-suppliers/:id/pricing" element={<VehiclePricing />} />
          <Route path="/resources/vehicle-suppliers/:id/edit" element={<VehicleSupplierForm />} />
          <Route path="/resources/vehicle-suppliers" element={<VehicleSuppliers />} />
          <Route path="/resources/vehicles" element={<VehiclesPage />} />
          <Route path="/resources/guides/new" element={<GuideForm />} />
          <Route path="/resources/guides/:id/pricing" element={<GuidePricing />} />
          <Route path="/resources/guides/:id/edit" element={<GuideForm />} />
          <Route path="/resources/guides" element={<Guides />} />
          <Route path="/resources/suppliers/new" element={<SupplierForm />} />
          <Route path="/resources/suppliers/:id/entrance-fees" element={<EntranceFeePricing />} />
          <Route path="/resources/suppliers/:id/service-pricing" element={<SupplierServicePricing />} />
          <Route path="/resources/suppliers/:id/edit" element={<SupplierForm />} />
          <Route path="/resources/suppliers" element={<Suppliers />} />
          <Route path="/entrance-fees/new" element={<EntranceFeeForm />} />
          <Route path="/entrance-fees" element={<AllEntranceFees />} />

          {/* Reservation Routes */}
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reservations/new" element={<ReservationForm />} />
          <Route path="/reservations/:id" element={<ReservationDetail />} />
          <Route path="/reservations/:id/edit" element={<ReservationForm />} />

          {/* Customer Management Routes */}
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/agents" element={<Agents />} />
          <Route path="/customers/agents/new" element={<AgentForm />} />
          <Route path="/customers/agents/:id" element={<AgentDetail />} />
          <Route path="/customers/agents/:id/edit" element={<AgentForm />} />
          <Route path="/customers/direct" element={<DirectClients />} />
          <Route path="/customers/direct/new" element={<ClientForm />} />
          <Route path="/customers/direct/:id/edit" element={<ClientForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
