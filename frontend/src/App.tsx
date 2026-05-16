import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Routes à venir : /menus, /menus/:id, /commande/:menuId, /auth/*, /espace, /admin */}
    </Routes>
  );
}
