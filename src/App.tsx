import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminProductPage } from './pages/AdminProductsPage';
import { OperarioProductsPage } from './pages/OperarioProductsPage';
import { OperarioOrderConfirmPage } from './pages/OperarioOrderConfirmPage';
import { AdminOrderPage } from './pages/AdminOrdersPage';



export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* publico */}
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/registro" element={<RegisterPage/>}/>

          {/* operario */}
          <Route path="/operario/productos" element={<OperarioProductsPage/>}/>
          <Route path="/operario/confirmar" element={<OperarioOrderConfirmPage/>}/>

          {/* admin */}
          <Route path="admin/productos" element={<AdminProductPage/>}/>
          <Route path="admin/pedidos" element={<AdminOrderPage/>}/>

          {/* redireccion por defecto */}
          <Route path="*" element={<Navigate to="login" replace/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;