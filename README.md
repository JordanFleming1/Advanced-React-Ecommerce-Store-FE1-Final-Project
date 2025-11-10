# 🛍️ Advanced React TypeScript Ecommerce Store

A modern, fully-featured ecommerce web application that I built with React, TypeScript, Redux Toolkit, and React Query. This project showcases my advanced frontend development skills and comprehensive understanding of modern web technologies. 
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

### **Technical Features**
- **Full TypeScript implementation** that I developed with strict type checking
- **Custom React Query hooks** that I created for API data management
- **Component composition** with reusable patterns I designed
- **Error boundaries** and graceful error handling I implemented
- **Performance optimizations** with React Query caching that I configured

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

1. **Clone my repository**
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

## 📚 API Integration

I integrated this project with the [FakeStore API](https://fakestoreapi.com/) for demo data, and later migrated to a custom Firebase implementation:

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

## 🎯 Key Development Concepts I Implemented

### **State Management Patterns I Used**
- **Local State** - UI state management I implemented with useState
- **Server State** - API data management I built with React Query
- **Global State** - Cart data management I created with Redux Toolkit
- **Persistent State** - SessionStorage integration I developed

### **TypeScript Implementation I Developed**
- **Interface definitions** I created for all data structures
- **Generic types** I designed for flexible components
- **Type-safe hooks** and event handlers I built
- **Strict type checking** I enforced throughout the application

### **React Patterns I Applied**
- **Custom hooks** I developed for logic reuse
- **Component composition** I designed for modularity
- **Props interfaces** I created for component contracts
- **Conditional rendering** I implemented for different states

### **Performance Optimization I Achieved**
- **React Query caching** strategies I configured for API efficiency
- **Memoization** techniques I applied
- **Image optimization** with fallbacks I implemented

## 🚀 How My Application Works

### **Data Flow I Architected**
1. **App starts** → I configured Redux Provider + React Query Provider to wrap the app
2. **Home component** → I implemented product fetching using React Query
3. **Category selection** → I built triggers for new API calls for filtered products
4. **Add to cart** → I created Redux actions that dispatch and update global state
5. **Cart persistence** → I developed automatic saving to sessionStorage
6. **Cart interaction** → I built real-time updates with quantity controls
7. **Checkout** → I implemented purchase simulation and cart clearing

### **State Architecture I Designed**
- **Redux Store**: Shopping cart items, totals, cart visibility that I manage
- **React Query Cache**: Products, categories with smart caching I configured
- **Local State**: UI state like selected category, image errors that I handle
- **SessionStorage**: Cart persistence across browser sessions that I implemented

## 🌟 What I Accomplished

### **Professional Features I Built**
✅ **Type-safe development** with full TypeScript coverage I implemented  
✅ **Smart data fetching** with React Query caching I configured  
✅ **Robust state management** with Redux Toolkit I integrated  
✅ **Responsive design** that I made work on all devices  
✅ **Error handling** with graceful fallbacks I created  
✅ **Image resilience** with placeholder fallbacks I developed  
✅ **Performance optimized** with efficient re-renders I achieved  
✅ **Accessibility** with proper ARIA attributes I added  

### **Advanced Patterns I Implemented**
- **Custom hooks** I developed for reusable logic
- **Component composition** I designed for modularity
- **TypeScript generics** I created for flexible types
- **Redux middleware** I configured for side effects
- **React Query optimizations** I implemented for caching

## 🙏 Acknowledgments

- **[FakeStore API](https://fakestoreapi.com/)** - Providing demo ecommerce data
- **[React Bootstrap](https://react-bootstrap.github.io/)** - UI components
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

---

⭐ **This project showcases my expertise in modern React development with TypeScript, Redux, and React Query!** ⭐
