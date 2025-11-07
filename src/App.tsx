import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './components/NavBar';
import Home from './components/Home';
import ShoppingCart from './components/ShoppingCart';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <NavBar />
      <Home />
      <ShoppingCart />
    </div>
  );
};

export default App;