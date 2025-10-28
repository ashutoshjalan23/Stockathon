# Stockathon - Trading Platform Frontend

A modern stock trading platform built with React, featuring a Bloomberg Terminal-inspired design. This application provides real-time stock trading, portfolio management, and comprehensive admin controls.

## 🚀 Tech Stack

- **React 19.1.1** - UI Framework
- **Vite 7.1.14** (rolldown-vite) - Build Tool & Dev Server
- **TailwindCSS v4.1.16** - Styling Framework
- **React Router DOM v7.9.4** - Client-side Routing
- **Axios 1.12.2** - HTTP Client
- **jwt-decode** - JWT Token Handling
- **React Hot Toast** - Toast Notifications
- **Lucide React** - Icon Library

## 📋 Features

### Authentication & Authorization
- **JWT-based authentication** (7-day token expiration)
- **Role-based access control** (Admin, Investor, Stock)
- **Protected routes** with automatic redirects
- **Persistent sessions** with localStorage
- **Admin-only user creation** via signup page

### Dashboards

#### 👨‍💼 Admin Dashboard
- **Overview Tab**: System statistics, top 5 stocks by market cap, recent transactions
- **Users Tab**: View all users (Admin, Investor, Stock) with filtering by role
- **Stocks Tab**: Complete stock listings with search, market cap calculations
- **Transactions Tab**: All system transactions with filtering by type (BUY/SELL)
- **Real-time stats**: Total stocks, investors, transactions, trading volume, market cap
- **Auto-refresh**: 10-second polling for live data updates

#### 💼 Investor Dashboard
- **Portfolio Tab**: View holdings with real-time values and "Go to Marketplace" button
- **Transaction History Tab**: Personal trading history
- **Live balance updates** every 10 seconds
- **Last update timestamp** with status indicator

#### 🏢 Stock Dashboard
- **Stock Statistics**: Current price, available shares, shares owned, total shares, market cap, total investors
- **Shareholders Table**: Shows investor IDs, shares owned, ownership %, portfolio value
- **Auto-refresh**: 10-second polling
- **Market cap calculation**: Total shares × current price

#### 📈 Marketplace
- **Table-based stock listing** with search and sort
- **Real-time data**: Stock prices, available shares, ownership info
- **Buy/Sell functionality** with modals and validation
- **Ownership tracking**: "You Own" column shows investor holdings
- **10-second auto-refresh** for live market data

### UI/UX Features
- **Bloomberg Terminal theme**: Dark mode with orange (#FF6B00) accents
- **Backend connectivity indicator**: Green pulsing dot when online, red when offline
- **Last update timestamps** across all dashboards
- **Responsive design** with horizontal scroll tables
- **Toast notifications** for success/error feedback
- **Loading states** and error handling

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx          # Login with redirect logic
│   │   │   ├── SignupForm.jsx         # Admin-only user creation (simple & advanced mode)
│   │   │   └── ProtectedRoute.jsx     # Route protection wrapper
│   │   └── layout/
│   │       └── Navbar.jsx              # Navigation with backend status
│   ├── context/
│   │   └── AuthContext.jsx             # Auth state management
│   ├── hooks/
│   │   └── useAuth.js                  # Auth context hook
│   ├── pages/
│   │   ├── AdminDashboard.jsx          # Admin control center
│   │   ├── InvestorDashboard.jsx       # Investor portfolio & history
│   │   ├── StockDashboard.jsx          # Stock company dashboard
│   │   ├── Marketplace.jsx             # Trading marketplace
│   │   └── NotFound.jsx                # 404 page
│   ├── services/
│   │   ├── api.js                      # Axios instance with interceptors
│   │   ├── authService.js              # Authentication API calls
│   │   ├── stockService.js             # Stock-related API calls
│   │   ├── portfolioService.js         # Portfolio API calls
│   │   ├── transactionService.js       # Transaction API calls
│   │   └── adminService.js             # Admin-only API calls
│   ├── utils/
│   │   └── constants.js                # API endpoints, roles, storage keys
│   ├── App.jsx                         # Main app with routing
│   ├── App.css                         # Global styles
│   └── index.css                       # TailwindCSS with Bloomberg theme
└── package.json
```

## 🔐 User Roles

### Admin
- Full system access
- Create new users (Admin, Investor, Stock)
- View all transactions and users
- Access to marketplace (view-only or trading)

### Investor
- Personal portfolio management
- Buy/sell stocks in marketplace
- Transaction history
- Real-time balance updates

### Stock
- View company statistics
- See shareholder information
- Track ownership distribution
- Monitor market cap

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v24.10.0 or higher
- Yarn package manager
- Backend API running on `http://localhost:3090`

### Environment Variables

Create a `.env` file in the frontend root directory by copying the example:

```bash
cp .env.example .env
```

Then update the values in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3090/api/v1
VITE_API_KEY=your_api_key_here
```

**Important**: 
- The `VITE_API_KEY` must match the `API_KEY` in the backend `.env.development.local`
- Never commit the actual `.env` file to version control
- The `.env.example` file serves as a template for other developers

### Install Dependencies

```bash
yarn install
```

### Development Server

```bash
yarn dev
```

The app will run on `http://localhost:5173`

### Build for Production

```bash
yarn build
```

### Preview Production Build

```bash
yarn preview
```

## 🔑 Authentication Flow

1. **Login**: User submits credentials → Backend validates → Returns JWT token + user data
2. **Token Storage**: Token and user info stored in `localStorage`
3. **Automatic Authentication**: On app load, checks for valid token in `localStorage`
4. **Token Validation**: Checks token expiration (5-minute buffer)
5. **Auto Redirect**: Logged-in users redirected to appropriate dashboard
6. **Protected Routes**: `ProtectedRoute` component validates role-based access
7. **Token Refresh**: Currently no refresh mechanism (7-day expiration)
8. **Logout**: Clears token and user data from `localStorage`

## 📡 API Integration

### Axios Interceptors

**Request Interceptor:**
- Adds `Authorization: Bearer <token>` header for protected routes
- Adds `x-api-key` header for admin-only endpoints
- Handles API key for specific routes: `/auth`, `/transactions`, `/investors/signup`, `/investors/all`, `/stocks` (POST)

**Response Interceptor:**
- **401**: Clears auth data, redirects to login (session expired)
- **403**: Logs access denied errors (invalid API key or permissions)
- **404**: Logs resource not found errors
- **500+**: Logs server errors

### Auto-Refresh Mechanism

All dashboards implement 10-second polling:
```javascript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
}, []);
```

## 🎨 Design System

### Colors
- **Primary**: `#FF6B00` (Bloomberg Orange)
- **Background**: `#0A0E27` (Navy)
- **Panel**: `#0D1B2A` (Dark Blue)
- **Success**: `#00FF00` (Terminal Green)
- **Error**: `#FF0000` (Terminal Red)
- **Accent**: `#FFD700` (Gold)
- **Text Primary**: `#FFFFFF` (White)
- **Text Secondary**: `#B0B0B0` (Gray)

### Typography
- **Monospace**: Courier New (for data, numbers, code)
- **Sans-serif**: Arial, Helvetica (for labels, text)

### Components
- **Panels**: Dark background with orange header border
- **Buttons**: Orange primary, green success, red danger
- **Tables**: Dark rows with hover effects
- **Inputs**: Dark fields with orange focus border

## 🔄 State Management

- **Global Auth State**: React Context (`AuthContext`)
- **Component State**: React `useState` hooks
- **Data Fetching**: `useEffect` with cleanup
- **Form State**: Controlled components

## 📝 Key Features Implementation

### Signup Form - Advanced Mode
- Toggle between simple and advanced modes
- **Simple**: Name, Password, Role
- **Advanced**: 
  - Investor: Initial balance (default $10,000)
  - Stock: Price per share, available shares (defaults: $100, 1000)
  - Admin: No additional fields

### Admin Dashboard - Users Tab
- Fetches all users from 3 sources:
  - All stocks via `/stocks/allstocks`
  - All investors via `/investors/all`
  - All admins via `/auth/all`
- Displays role-specific details:
  - **Stock**: Price per share, available shares
  - **Investor**: Balance, holdings count, portfolio value
  - **Admin**: "System Administrator" label

### Transaction Display
- Handles both `stock` and `startup` fields (schema compatibility)
- Displays timestamps (uses `timestamp` field, falls back to `createdAt`)
- Color-coded: Green for BUY, Red for SELL
- Calculates total value: shares × price per share

### Stock Ownership
- Backend populates investor data: `.populate('Owners.investor', 'name _id')`
- Fixed schema typo: `'Inevstors'` → `'Investors'`
- Displays investor IDs in monospace font

## 🐛 Known Issues & Solutions

### Issue: Investor names show as "Unknown"
**Solution**: Backend now populates investor data in stock owners

### Issue: Transaction dates show "N/A"
**Solution**: Updated to use `timestamp` field from schema

### Issue: `/auth/all` returns 404
**Solution**: Moved route before catch-all `GET /auth` route

### Issue: Not all users showing in Admin Dashboard
**Solution**: Now fetches from 3 separate endpoints (stocks, investors, admins)

## 🚦 Routes

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | Home | All | Redirects to appropriate dashboard |
| `/login` | LoginForm | Public | User authentication |
| `/signup` | SignupForm | Admin only | Create new users |
| `/admin/dashboard` | AdminDashboard | Admin only | System control center |
| `/investor/dashboard` | InvestorDashboard | Investor only | Portfolio management |
| `/stock/dashboard` | StockDashboard | Stock only | Company statistics |
| `/marketplace` | Marketplace | Investor + Admin | Trading platform |

## 📦 Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.9.4",
  "axios": "^1.12.2",
  "jwt-decode": "^4.0.0",
  "react-hot-toast": "^2.4.1",
  "lucide-react": "^0.548.0",
  "tailwindcss": "^4.1.16",
  "vite": "^7.1.14"
}
```

## 👨‍💻 Development Notes

### Code Style
- **Named exports** for services and hooks
- **Default exports** for components
- **Arrow functions** for components
- **camelCase** for variables and functions
- **PascalCase** for components

### Best Practices
- Use `isInvestor`, `isAdmin`, `isStock` (not `!isAdmin`)
- Check `authLoading` before authentication checks
- Use `replace: true` for navigation redirects
- Handle loading and error states
- Cleanup intervals and subscriptions in `useEffect`

## 🔮 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Charts and data visualization
- [ ] Export reports (CSV, PDF)
- [ ] Stock price history graphs
- [ ] Advanced filtering and sorting
- [ ] Bulk user operations
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Password reset functionality
- [ ] User profile management

## 📄 License

This project is part of the Stockathon platform.

---

Yes the readme file is made using ai, it is a pain to make this :(

**Built with ❤️ using React + Vite + TailwindCSS**
