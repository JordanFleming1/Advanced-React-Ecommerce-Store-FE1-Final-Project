# 🛍️ Advanced React E-commerce Store

A modern, feature-rich e-commerce application built with React 19, TypeScript, and Firebase.

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/actions/workflows/main.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/actions/workflows/main.yml)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## ✨ Features

### 🛒 **Shopping Cart System**
- **Redux Toolkit** state management with TypeScript
- **SessionStorage persistence** - cart survives page refresh
- **Real-time cart updates** with automatic total calculations
- **Cart sidebar** with quantity controls and item removal
- **Checkout simulation** with success feedback

### 🔍 **Product Catalog**
- **React Query integration** for efficient API data fetching
- **Responsive grid layout** adapting to all screen sizes
- **Image fallback handling** for broken API image URLs
- **Loading states and error handling** for better UX
- **User-specific products** - each user sees only their own products

### 🎨 **User Interface**
- **Bootstrap 5** for professional styling
- **Responsive design** - mobile-first approach
- **Loading spinners** and error messages
- **Real-time cart badge** showing item count
- **Smooth animations** and hover effects

### **Technical Features**
- **Full TypeScript implementation** with strict type checking
- **Custom React Query hooks** for API data management
- **Component composition** with reusable patterns
- **Error boundaries** and graceful error handling
- **Performance optimizations** with React Query caching

## 📚 Documentation

All detailed documentation has been organized in the `docs/` folder:

### Core Documentation
- **[Main README](./docs/README.md)** - Complete project overview and setup instructions
- **[Deployment Guide](./docs/DEPLOYMENT-GUIDE.md)** - Production deployment with Vercel
- **[CI/CD Implementation](./docs/CI-CD-IMPLEMENTATION.md)** - GitHub Actions workflows

### Feature Documentation
- **[Authentication Guide](./docs/AUTHENTICATION.md)** - Firebase authentication implementation
- **[Product Management](./docs/FIRESTORE_PRODUCTS.md)** - Firestore product data management
- **[User-Specific Products](./docs/USER-SPECIFIC-PRODUCTS.md)** - Personal product catalogs per user
- **[Testing Guide](./docs/TESTING.md)** - Testing setup and guidelines

### Development Resources
- **[Product Debug Guide](./docs/PRODUCT-DEBUG-GUIDE.md)** - Troubleshooting common issues

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### **State Management**
- **Redux Toolkit** - Predictable state container
- **React Query (TanStack Query)** - Server state management
- **React Context** - Component-level state

### **Backend Services**
- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Security Rules** - Data protection

### **UI Framework**
- **React Bootstrap** - Component library
- **Bootstrap 5** - CSS framework
- **CSS Modules** - Scoped styling

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **React Testing Library** - Component testing

### **Deployment**
- **Vercel** - Production hosting
- **GitHub Actions** - CI/CD pipeline
- **npm** - Package management

## 🔗 Live Demo

**Production**: [Your Vercel URL]

## 📦 Project Structure

```
src/
├── components/     # React components
├── contexts/      # React contexts
├── store/         # Redux store
├── hooks/         # Custom hooks
├── utils/         # Utility functions
├── types/         # TypeScript types
└── test/          # Test utilities

docs/              # All documentation files
├── README.md
├── AUTHENTICATION.md
├── CI-CD-IMPLEMENTATION.md
├── DEPLOYMENT-GUIDE.md
├── FIRESTORE_PRODUCTS.md
├── PRODUCT-DEBUG-GUIDE.md
├── TESTING.md
└── USER-SPECIFIC-PRODUCTS.md
```

## 🔐 User-Specific Features

### **Personal Product Catalogs**
- Each user has their own private product inventory
- Products are automatically associated with the user who created them
- Unauthenticated users cannot view any products
- Complete data isolation between users

### **Authentication Requirements**
- Sign in required to view products
- Product creation requires authentication
- User-specific categories and statistics
- Secure product ownership validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Firebase account for backend services

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Firebase (see [Authentication Guide](./docs/AUTHENTICATION.md))
4. Start development server: `npm run dev`

### Testing
- Run tests: `npm test`
- Run tests with UI: `npm run test:ui`
- Generate coverage: `npm run test:coverage`

### Building for Production
- Build: `npm run build`
- Preview build: `npm run preview`

## 🤝 Contributing

1. Check the documentation in the `docs/` folder
2. Follow the testing guidelines in `docs/TESTING.md`
3. Refer to the debug guide if you encounter issues

---

For detailed setup instructions and feature documentation, please refer to the files in the `docs/` directory. 

```bash## ✨ Features

npm install

npm run dev### 🛒 **Shopping Cart System**

```- **Redux Toolkit** state management with TypeScript

- **SessionStorage persistence** - cart survives page refresh

## 📚 Documentation- **Real-time cart updates** with automatic total calculations

- **Cart sidebar** with quantity controls and item removal

All detailed documentation has been organized in the `docs/` folder:- **Checkout simulation** with success feedback



### Core Documentation### 🔍 **Product Catalog**

- **[Main README](./docs/README.md)** - Complete project overview and setup instructions- **Dynamic product filtering** by category

- **[Deployment Guide](./docs/DEPLOYMENT-GUIDE.md)** - Production deployment with Vercel- **React Query integration** for efficient API data fetching

- **[CI/CD Implementation](./docs/CI-CD-IMPLEMENTATION.md)** - GitHub Actions workflows- **Responsive grid layout** adapting to all screen sizes

- **Image fallback handling** for broken API image URLs

### Feature Documentation- **Loading states and error handling** for better UX

- **[Authentication Guide](./docs/AUTHENTICATION.md)** - Firebase authentication implementation

- **[Product Management](./docs/FIRESTORE_PRODUCTS.md)** - Firestore product data management### 🎨 **User Interface**

- **[Testing Guide](./docs/TESTING.md)** - Testing setup and guidelines- **Bootstrap 5** for professional styling

- **Responsive design** - mobile-first approach

### Development Resources- **Loading spinners** and error messages

- **[Product Debug Guide](./docs/PRODUCT-DEBUG-GUIDE.md)** - Troubleshooting common issues- **Real-time cart badge** showing item count

- **Smooth animations** and hover effects

## 🛠 Tech Stack

### **Technical Features**

- **Frontend**: React 19, TypeScript, Vite- **Full TypeScript implementation** that I developed with strict type checking

- **State Management**: Redux Toolkit, TanStack Query- **Custom React Query hooks** that I created for API data management

- **Authentication**: Firebase Auth- **Component composition** with reusable patterns I designed

- **Database**: Cloud Firestore- **Error boundaries** and graceful error handling I implemented

- **Styling**: Bootstrap, CSS Modules- **Performance optimizations** with React Query caching that I configured

- **Testing**: Vitest, Happy DOM

- **Deployment**: Vercel with GitHub Actions CI/CD## 🛠️ Tech Stack



## 🔗 Live Demo### **Frontend Framework**

- **React 19** - Modern React with hooks

**Production**: [Your Vercel URL]- **TypeScript** - Type-safe JavaScript

- **Vite** - Fast build tool and dev server

## 📦 Project Structure

### **State Management**

```- **Redux Toolkit** - Simplified Redux for cart management

src/- **React Query (TanStack Query)** - Server state management

├── components/     # React components

├── contexts/      # React contexts### **UI & Styling**

├── store/         # Redux store- **React Bootstrap** - Bootstrap components for React

├── hooks/         # Custom hooks- **Bootstrap 5** - Responsive CSS framework

├── utils/         # Utility functions- **CSS3** - Custom styling and animations

├── types/         # TypeScript types

└── test/          # Test utilities### **API Integration**

- **FakeStore API** - Demo ecommerce API

docs/              # All documentation files- **Fetch API** - HTTP requests

├── README.md- **React Query** - Caching and synchronization

├── AUTHENTICATION.md

├── CI-CD-IMPLEMENTATION.md### **Development Tools**

├── DEPLOYMENT-GUIDE.md- **ESLint** - Code linting

├── FIRESTORE_PRODUCTS.md- **TypeScript Compiler** - Type checking

├── PRODUCT-DEBUG-GUIDE.md- **Vite HMR** - Hot module replacement

└── TESTING.md

```### Installation



## 🤝 Contributing1. **Clone my repository**

```bash

1. Check the documentation in the `docs/` foldergit clone https://github.com/JordanFleming1/Advanced-React-Ecommerce-Store-FE1-Final-Project.git

2. Follow the testing guidelines in `docs/TESTING.md`cd Advanced-React-Ecommerce-Store-FE1-Final-Project

3. Refer to the debug guide if you encounter issues```



---2. **Install dependencies**

```bash

For detailed setup instructions and feature documentation, please refer to the files in the `docs/` directory.npm install
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
npm run lint:fix     # Fix ESLint issues automatically
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Run tests with UI

# CI/CD
npm run ci           # Run full CI pipeline (lint + type-check + build + test)
```

## 🚀 CI/CD Pipeline

This project includes a comprehensive **Continuous Integration and Continuous Deployment** pipeline using **GitHub Actions** with **automatic deployment to Vercel**:

### **Automated Workflows**

#### 🔄 **Build and Test Workflow** (`ci.yml`)
Triggers on every push and pull request to the `main` branch:

1. **Environment Setup**
   - Ubuntu latest runner
   - Node.js 20.x with npm caching
   - Install dependencies with `npm ci`

2. **Code Quality Checks**
   - **ESLint**: Code linting and style enforcement
   - **TypeScript**: Type checking with `tsc --noEmit`

3. **Build Process**
   - **Production Build**: `npm run build`
   - **Build Artifact Upload**: Dist files stored for deployment

4. **Testing Phase**
   - **Unit Tests**: Comprehensive test suite with Vitest
   - **Test Results**: Coverage reports uploaded as artifacts
   - **Failure Prevention**: Workflow fails if any tests fail

5. **Deployment Readiness**
   - Confirmation that code is ready for production deployment
   - Only runs on successful main branch pushes

#### 🛡️ **Comprehensive CI/CD Pipeline** (`main.yml`)
Extended workflow with **automatic deployment** and multi-environment testing:

1. **Continuous Integration**
   - **Matrix Strategy**: Tests against Node.js 18.x and 20.x
   - **Security Auditing**: `npm audit` for vulnerability scanning
   - **Artifact Management**: Test results and build files with 30-day retention

2. **🚀 Continuous Deployment**
   - **Production Deployment**: Automatic deployment to Vercel on main branch
   - **Preview Deployments**: Automatic preview URLs for pull requests
   - **Environment Protection**: Deployment only after all tests pass
   - **Rollback Safety**: Previous versions remain accessible

3. **🌐 Multi-Environment Strategy**
   - **Production**: `main` branch → Live production site
   - **Staging/Preview**: Pull requests → Preview environments
   - **Environment URLs**: Automatically posted in GitHub deployments

#### 🔧 **Deployment Process**

**For Production (main branch pushes):**
1. ✅ CI tests must pass (build-and-test job)
2. ✅ Security audit must pass (security-audit job)
3. 🚀 Automatic deployment to Vercel production
4. 📧 Deployment status posted to GitHub
5. 🌐 Live site updated instantly

**For Pull Requests:**
1. ✅ CI tests must pass
2. 🔍 Preview deployment created
3. 💬 Preview URL commented on PR
4. 🔄 Auto-updates with new commits

### **🌍 Deployment Infrastructure**

#### **Vercel Platform**
- **Framework**: Optimized for Vite React apps
- **CDN**: Global edge network for fast loading
- **HTTPS**: Automatic SSL certificates
- **Custom Domains**: Production domain support
- **Analytics**: Performance monitoring included

#### **Configuration**
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Node Version**: 20.x
- **Environment Variables**: Managed through Vercel dashboard
- **SPA Routing**: Configured for React Router

### **CI/CD Benefits**

✅ **Automated Quality Assurance**: Every code change is automatically tested  
✅ **Zero-Downtime Deployments**: Seamless updates without service interruption  
✅ **Preview Environments**: Test changes before merging with automatic previews  
✅ **Rollback Capability**: Quick reversion to previous versions if needed  
✅ **Code Quality Enforcement**: Linting and type checking on every commit  
✅ **Multi-Environment Testing**: Compatibility across Node.js versions  
✅ **Security Monitoring**: Automated vulnerability scanning  
✅ **Build Verification**: Ensures production build works before deployment  
✅ **Global CDN**: Fast loading times worldwide via Vercel's edge network  

### **Workflow Configuration**

The CI pipeline is configured to:
- **Fail Fast**: Stop execution if any step fails
- **Cache Dependencies**: Speed up builds with npm caching
- **Artifact Storage**: Preserve test results and build files
- **Branch Protection**: Only allow tested code to reach main branch

### **Running CI Locally**

You can simulate the CI pipeline locally:
```bash
# Run the complete CI pipeline
npm run ci

# Individual steps
npm run lint && \
npm run type-check && \
npm run build && \
npm run test:run
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

---

## ⚙️ Deployment Setup

### **🚀 Setting Up Vercel Deployment**

To enable automatic deployment to Vercel, follow these steps:

#### **1. Create Vercel Account**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

#### **2. Configure GitHub Repository**
1. **Import Repository** to Vercel dashboard
2. **Connect GitHub** account to Vercel
3. **Select Repository** for deployment

#### **3. Set Environment Variables**
In your GitHub repository settings → Secrets and variables → Actions, add:

```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here  
VERCEL_PROJECT_ID=your_project_id_here
```

#### **4. Get Vercel Secrets**
```bash
# Get your Vercel token
vercel --help  # Shows how to create tokens

# Get project details
vercel link  # Links local project to Vercel project
cat .vercel/project.json  # Shows project ID and org ID
```

#### **5. Configure Vercel Project**
- **Framework**: Automatically detected as Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### **🔄 Deployment Workflow**

#### **Automatic Deployment Triggers**
- **Production**: Push to `main` branch
- **Preview**: Create pull request
- **Manual**: Trigger workflow manually

#### **Deployment Process**
1. ✅ **CI Tests Pass** → Required for deployment
2. 🔨 **Build Application** → Vite production build
3. 🚀 **Deploy to Vercel** → Automatic deployment
4. 🌐 **Update Live Site** → Zero-downtime deployment
5. 📧 **Notify GitHub** → Deployment status updates

### **📊 Deployment Features**

#### **Production Deployment**
- **Custom Domain** support
- **HTTPS** automatically configured
- **Global CDN** for fast loading
- **Automatic SSL** certificates
- **Environment Variables** managed securely

#### **Preview Deployments**
- **Unique URLs** for each PR
- **Automatic Comments** on pull requests
- **Branch Deployments** for testing
- **Shareable Links** for stakeholders

#### **Monitoring & Analytics**
- **Real-time Metrics** via Vercel dashboard
- **Performance Insights** and Core Web Vitals
- **Error Tracking** and deployment logs
- **Traffic Analytics** and visitor metrics

---

## 🙏 Acknowledgments

- **[FakeStore API](https://fakestoreapi.com/)** - Providing demo ecommerce data
- **[React Bootstrap](https://react-bootstrap.github.io/)** - UI components
- **[Redux Toolkit](https://redux-toolkit.js.org/)** - State management
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

---

⭐ **This project showcases my expertise in modern React development with TypeScript, Redux, and React Query!** ⭐
