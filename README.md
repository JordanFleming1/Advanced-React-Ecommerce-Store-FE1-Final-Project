# 🛍️ Advanced React TypeScript Ecommerce Store

A modern, fully-featured ecommerce web application built with React, TypeScript, Redux Toolkit, and React Query. This project demonstrates advanced frontend development 
## ✨ Features

### 🛒 **Shopping Cart System**
- **Redux Toolkit** state management with TypeScript
- **SessionStorage persistence** - cart survives page refresh
- **Real-time cart updates** with automatic total calculations
- **Cart sidebar** with quantity controls and item removal
- **Checkout simulation** with success feedback

### 🔍 **Product Catalog**
- **Dynamic product filtering** by category
- **React Query integration** for efficient API data fetching
- **Responsive grid layout** adapting to all screen sizes
- **Image fallback handling** for broken API image URLs
- **Loading states and error handling** for better UX

### 🎨 **User Interface**
- **Bootstrap 5** for professional styling
- **Responsive design** - mobile-first approach
- **Loading spinners** and error messages
- **Real-time cart badge** showing item count
- **Smooth animations** and hover effects

### 🛠️ **Technical Features**
- **Full TypeScript implementation** with strict type checking
- **Custom React Query hooks** for API data management
- **Component composition** with reusable patterns
- **Error boundaries** and graceful error handling
- **Performance optimizations** with React Query caching

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### **State Management**
- **Redux Toolkit** - Simplified Redux for cart management
- **React Query (TanStack Query)** - Server state management

### **UI & Styling**
- **React Bootstrap** - Bootstrap components for React
- **Bootstrap 5** - Responsive CSS framework
- **CSS3** - Custom styling and animations

### **API Integration**
- **FakeStore API** - Demo ecommerce API
- **Fetch API** - HTTP requests
- **React Query** - Caching and synchronization

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **Vite HMR** - Hot module replacement

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/JordanFleming1/Advanced-React-Ecommerce-Store-FE1-Final-Project.git
cd Advanced-React-Ecommerce-Store-FE1-Final-Project
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## 📚 API Reference

This project uses the [FakeStore API](https://fakestoreapi.com/) for demo data:

### **Endpoints Used**
- `GET /products` - Fetch all products
- `GET /products/categories` - Fetch product categories  
- `GET /products/category/{category}` - Fetch products by category

### **Example Product Data**
```json
{
  "id": 1,
  "title": "Fjallraven - Foldsack No. 1 Backpack",
  "price": 109.95,
  "description": "Your perfect pack for everyday use...",
  "category": "men's clothing",
  "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
  "rating": {
    "rate": 3.9,
    "count": 120
  }
}
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🎯 Key Learning Concepts

### **State Management Patterns**
- **Local State** - UI state with useState
- **Server State** - API data with React Query
- **Global State** - Cart data with Redux Toolkit
- **Persistent State** - SessionStorage integration

### **TypeScript Implementation**
- **Interface definitions** for all data structures
- **Generic types** for flexible components
- **Type-safe hooks** and event handlers
- **Strict type checking** throughout the application

### **React Patterns**
- **Custom hooks** for logic reuse
- **Component composition** for modularity
- **Props interfaces** for component contracts
- **Conditional rendering** for different states

### **Performance Optimization**
- **React Query caching** for API efficiency
- **Memoization** strategies
- **Image optimization** with fallbacks

## 🚀 How It Works

### **Data Flow**
1. **App starts** → Redux Provider + React Query Provider wrap the app
2. **Home component** → Fetches products using React Query
3. **Category selection** → Triggers new API call for filtered products
4. **Add to cart** → Dispatches Redux action, updates global state
5. **Cart persistence** → Automatically saves to sessionStorage
6. **Cart interaction** → Real-time updates with quantity controls
7. **Checkout** → Simulates purchase and clears cart

### **State Architecture**
- **Redux Store**: Shopping cart items, totals, cart visibility
- **React Query Cache**: Products, categories with smart caching
- **Local State**: UI state like selected category, image errors
- **SessionStorage**: Cart persistence across browser sessions

## 🌟 Highlights

### **Professional Features**
✅ **Type-safe development** with full TypeScript coverage  
✅ **Smart data fetching** with React Query caching  
✅ **Robust state management** with Redux Toolkit  
✅ **Responsive design** that works on all devices  
✅ **Error handling** with graceful fallbacks  
✅ **Image resilience** with placeholder fallbacks  
✅ **Performance optimized** with efficient re-renders  
✅ **Accessibility** with proper ARIA attributes  

### **Advanced Patterns**
- **Custom hooks** for reusable logic
- **Component composition** for modularity
- **TypeScript generics** for flexible types
- **Redux middleware** for side effects
- **React Query optimizations** for caching

## 🙏 Acknowledgments

- **[FakeStore API](https://fakestoreapi.com/)** - Providing demo ecommerce data
- **[React Bootstrap](https://react-bootstrap.github.io/)** - UI components
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

---

⭐ **This project demonstrates modern React development with TypeScript, Redux, and React Query!** ⭐
