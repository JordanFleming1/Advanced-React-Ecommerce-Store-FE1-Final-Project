import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Login from './components/Login';
import Registration from './components/Registration';
import UserProfile from './components/UserProfile';
import ProfileEdit from './components/ProfileEdit';
import ProductManagement from './components/ProductManagement';
import OrderHistory from './components/OrderHistory';
import FirebaseTest from './components/FirebaseTest';
import DebugProducts from './components/DebugProducts';
import ShoppingCart from './components/ShoppingCart';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/test-firebase" element={<FirebaseTest />} />
            <Route path="/debug-products" element={<DebugProducts />} />
          </Routes>
          <ShoppingCart />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;