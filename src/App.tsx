import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {Login} from "./routes/auth/Login";
import {Register} from "./routes/auth/Register";

import {UserProductsPage} from "./routes/user/UserProductsPage";
import {UserCartPage} from "./routes/user/UserCartPage";
import { UserOrdersHistory } from "./routes/user/UserOrdersHistory";

import {AdminOrdersPage} from "./routes/admin/AdminOrdersPage";
import {AdminProductsPage} from "./routes/admin/AdminProductsPage";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

const App = () => {
  return (
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
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}> <AdminOrdersPage /> </ProtectedRoute> } />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}> <AdminProductsPage /> </ProtectedRoute> } />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
