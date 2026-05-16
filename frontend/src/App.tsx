import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Menus } from './pages/Menus';
import { MenuDetail } from './pages/MenuDetail';
import { Order } from './pages/Order';
import { Contact } from './pages/Contact';
import { MentionsLegales, CGV } from './pages/Legal';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Forgot, Reset } from './pages/auth/ForgotReset';
import { UserEspace } from './pages/user/Espace';
import { OrderDetail } from './pages/user/OrderDetail';
import { EmployeeEspace } from './pages/employee/Espace';
import { AdminEspace } from './pages/admin/Espace';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/menus" element={<Menus />} />
        <Route path="/menus/:id" element={<MenuDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgv" element={<CGV />} />

        {/* Auth */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot" element={<Forgot />} />
        <Route path="/auth/reset" element={<Reset />} />

        {/* Authenticated */}
        <Route path="/commander/:menuId" element={<ProtectedRoute><Order /></ProtectedRoute>} />
        <Route path="/espace" element={<ProtectedRoute><UserEspace /></ProtectedRoute>} />
        <Route path="/espace/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

        {/* Pro */}
        <Route path="/employee" element={<ProtectedRoute roles={['employe', 'administrateur']}><EmployeeEspace /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['administrateur']}><AdminEspace /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="container-edit py-32 text-center">
            <p className="font-display text-display-lg text-bordeaux-700">404</p>
            <p className="text-cafe-700 mt-3">Cette page n'existe pas.</p>
          </div>
        } />
      </Route>
    </Routes>
  );
}
