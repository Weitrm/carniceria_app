import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

import {Login} from "./routes/auth/Login";
import {Register} from "./routes/auth/Register";

import {UserProductsPage} from "./routes/user/UserProductsPage";
import {UserCartPage} from "./routes/user/UserCartPage";
import { UserOrdersHistory } from "./routes/user/UserOrdersHistory";

import { AdminHomePage } from "./routes/admin/AdminHomePage";
import {AdminOrdersPage} from "./routes/admin/AdminOrdersPage";
import {AdminProductsPage} from "./routes/admin/AdminProductsPage";
import { AdminProductTotalsPage } from "./routes/admin/AdminProductTotalsPage";
import { AdminOrderPermissionsPage } from "./routes/admin/AdminOrderPermissionsPage";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";


const App = () => {
  
  const queryClient = new QueryClient();
  
  return (

    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route path="/user/products" element={<ProtectedRoute allowedRoles={['operario']}> <UserProductsPage /> </ProtectedRoute>} />
        <Route path="/user/cart" element={<ProtectedRoute allowedRoles={['operario']}> <UserCartPage /> </ProtectedRoute> } />
        <Route path="/user/history" element={<ProtectedRoute allowedRoles={['operario']}> <UserOrdersHistory /> </ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}> <AdminHomePage /> </ProtectedRoute> } />
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}> <AdminOrdersPage /> </ProtectedRoute> } />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}> <AdminProductsPage /> </ProtectedRoute> } />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}> <AdminProductTotalsPage /> </ProtectedRoute> } />
        <Route path="/admin/permissions" element={<ProtectedRoute allowedRoles={['admin']}> <AdminOrderPermissionsPage /> </ProtectedRoute> } />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
