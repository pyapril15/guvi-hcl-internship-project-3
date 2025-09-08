# InvoiceFlow - Professional Invoice Generator

A comprehensive, production-ready invoice generation system built for freelancers and small businesses. Create, manage, and send professional invoices with ease.

## 🚀 Features

### Core Functionality
- **Multi-user Authentication** - Secure login/signup system with Firebase Auth
- **Client Management** - Add, edit, and manage client information
- **Invoice Creation** - Dynamic invoice forms with itemized billing
- **PDF Generation** - Professional PDF invoices using pdfmake
- **Email Integration** - Send invoices directly via email
- **Real-time Data** - Live syncing with Firebase Firestore
- **Tax Calculations** - Automatic GST/tax calculations
- **Payment Tracking** - Track invoice status (Draft, Sent, Paid, Overdue)

### Advanced Features
- **Dashboard Analytics** - Revenue tracking and invoice statistics
- **Responsive Design** - Works perfectly on all devices
- **Search & Filtering** - Easy invoice and client management
- **Business Branding** - Custom business information and settings
- **Data Export** - Export functionality for invoices and client data
- **Secure Storage** - Files stored in Firebase Storage with proper security rules

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **PDF Generation**: pdfmake
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form + Yup validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Build Tool**: Vite

## 🏗 Architecture

The application follows a modular, scalable architecture:

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard components
│   ├── invoices/       # Invoice management
│   ├── clients/        # Client management
│   ├── layout/         # Layout components
│   └── settings/       # Settings components
├── contexts/           # React contexts
├── services/           # API and service layers
├── types/             # TypeScript type definitions
├── config/            # Configuration files
└── utils/             # Utility functions
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore, Authentication, and Storage enabled

### 1. Clone Repository
```bash
git clone https://github.com/pyapril15/guvi-hcl-internship-project-3.git
cd guvi-hcl-internship-project-3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration

#### 3.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication, Firestore Database, and Storage

#### 3.2 Configure Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Disable email verification (optional)

#### 3.3 Setup Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Apply the security rules from `firestore.rules`

#### 3.4 Configure Storage
1. Go to Storage
2. Create a bucket
3. Create a folder named "Automated Invoice Generator"
4. Apply the security rules from `storage.rules`

#### 3.5 Get Firebase Config
1. Go to Project Settings
2. Add a web app
3. Copy the configuration object
4. Update `src/config/firebase.ts` with your config

### 4. Environment Setup
The Firebase configuration is directly in the code. For production, consider using environment variables:

```bash
# .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

## 🔐 Security Rules

### Firestore Rules
The application uses comprehensive Firestore security rules to ensure data isolation:

- Users can only access their own data
- Client documents are user-scoped
- Invoice documents are user-scoped
- All operations require authentication

### Storage Rules
Storage rules ensure file security:

- Users can only access their own invoice PDFs
- Profile images and logos have appropriate read/write permissions
- All uploads require authentication

## 📱 Usage Guide

### Getting Started
1. **Create Account** - Sign up with email and password
2. **Complete Profile** - Add business information in Settings
3. **Add Clients** - Create client profiles with contact details
4. **Create Invoice** - Generate professional invoices with itemized billing
5. **Send & Track** - Email invoices and track payment status

### Key Features

#### Dashboard
- Revenue overview and statistics
- Recent invoice activity
- Pending and overdue alerts
- Quick access to key functions

#### Invoice Management
- Create invoices with multiple line items
- Automatic tax calculations
- PDF generation and download
- Email integration with pre-filled templates
- Status tracking (Draft → Sent → Paid)

#### Client Management
- Complete client database
- Contact information and billing addresses
- GSTIN support for Indian businesses
- Easy client selection during invoice creation

#### Settings
- Business profile customization
- Tax configuration
- Account management
- Data export options

## 🚀 Deployment

### Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Other Platforms
The application can be deployed to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run linting
npm run lint
```

## 📊 Performance Optimizations

- **Code Splitting** - Dynamic imports for route-based splitting
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Compressed and properly sized images
- **Caching** - Firebase caching for improved performance
- **Bundle Analysis** - Regular bundle size monitoring

## 🔄 Data Flow

```
User Action → Component → Service Layer → Firebase → Real-time Updates
```

1. **User Interaction** - User performs action in UI
2. **Component Handler** - Component processes the action
3. **Service Call** - Service layer handles Firebase operations
4. **Database Update** - Firestore updates data
5. **Real-time Sync** - UI automatically reflects changes

## 🛡 Best Practices Implemented

### Code Organization
- Modular component structure
- Separation of concerns
- TypeScript for type safety
- Consistent naming conventions

### Security
- Client-side validation
- Server-side security rules
- Data sanitization
- Secure authentication flow

### Performance
- Optimized re-renders
- Efficient data fetching
- Proper error boundaries
- Loading states

### UX/UI
- Responsive design
- Accessible components
- Intuitive navigation
- Clear feedback messages

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue on GitHub
- Email: support@invoiceflow.com
- Documentation: [docs.invoiceflow.com](https://docs.invoiceflow.com)

## 🎯 Roadmap

### Upcoming Features
- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Payment gateway integration
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] API for third-party integrations
- [ ] Invoice templates
- [ ] Expense tracking
- [ ] Time tracking integration
- [ ] Multi-language support

---

## 🏆 Production Checklist

### Before Deployment
- [ ] Update Firebase configuration
- [ ] Set up proper error monitoring
- [ ] Configure analytics
- [ ] Test all user flows
- [ ] Optimize images and assets
- [ ] Set up backup strategies
- [ ] Configure proper CORS settings
- [ ] Test email functionality
- [ ] Verify PDF generation
- [ ] Check mobile responsiveness

### After Deployment
- [ ] Monitor performance metrics
- [ ] Set up user feedback collection
- [ ] Monitor error rates
- [ ] Regular security audits
- [ ] Backup database regularly
- [ ] Update dependencies
- [ ] Monitor costs and usage

---

Built with ❤️ by [PyApril15](https://github.com/pyapril15) for the GUVI HCL Internship Project.

## 📸 Screenshots

### Authentication
- Modern login/signup with gradient background
- Form validation and error handling
- Responsive design

### Dashboard
- Revenue analytics and statistics
- Recent activity overview
- Quick action buttons
- Status indicators

### Invoice Management
- Professional invoice creation
- Real-time calculations
- PDF preview and download
- Email integration

### Client Management
- Comprehensive client database
- Contact information management
- Easy search and filtering

---

**InvoiceFlow** - Making professional invoicing simple and efficient for everyone.