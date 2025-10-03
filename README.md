# SharedTimer v1

A cross-platform household timer application built with React Native (Expo) and Next.js, featuring real-time synchronization across multiple devices and user profiles.

## 🚀 Features

- **Multi-Device Sync**: Real-time timer synchronization across devices
- **User Profiles**: Multiple user profiles with individual timer controls
- **Appliance Management**: Support for washing machine, dryer, air fryer, and gas stove
- **Washing Modes**: Pre-configured washing machine modes with different durations
- **Cross-Platform**: Native mobile app (iOS/Android) and web application
- **Authentication**: Secure user authentication with Supabase
- **Real-time Updates**: Live timer updates using Supabase realtime subscriptions

## 🛠️ Tech Stack

### Mobile App (Expo/React Native)
- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router
- **UI**: React Native Paper
- **State Management**: React Context + Hooks
- **Backend**: Supabase
- **Testing**: Jest + React Native Testing Library

### Web App (Next.js)
- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth UI
- **Backend**: Supabase

## 📱 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account and project

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SharedTimer_v1
   ```

2. **Set up environment variables**

   For mobile app (`mobile/SharedTimer/.env`):
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   For web app (`web/shared-timer/.env.local`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Mobile App Development

1. **Navigate to mobile directory**
   ```bash
   cd mobile/SharedTimer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on specific platforms**
   ```bash
   npm run android    # Android
   npm run ios        # iOS
   npm run web        # Web
   ```

5. **Run tests**
   ```bash
   npm test
   ```

### Web App Development

1. **Navigate to web directory**
   ```bash
   cd web/shared-timer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🧪 Testing

The mobile app includes comprehensive testing setup:

- **Unit Tests**: Jest with React Native Testing Library
- **Integration Tests**: Custom hooks and components
- **Mocking**: Supabase client and React Native modules

Run tests:
```bash
cd mobile/SharedTimer
npm test
```

## 📊 Database Schema

The application uses Supabase with the following main tables:

- **profiles**: User profiles with names and settings
- **timers**: Real-time timer states for each appliance
- **notifications**: Timer completion notifications

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication (email/password)
3. Create the required database tables
4. Configure Row Level Security (RLS) policies
5. Set up realtime subscriptions for timer updates

### App Configuration

- **Timer Durations**: Configured in `components/washingModes.ts`
- **Appliance Types**: Defined in `components/appliances.ts`
- **Real-time Settings**: Configured in Supabase client setup

## 🚀 Deployment

### Mobile App

1. **Build for production**
   ```bash
   expo build:android
   expo build:ios
   ```

2. **Deploy to app stores**
   - Follow Expo's deployment guide
   - Configure app store listings

### Web App

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   - Connect your repository
   - Configure environment variables
   - Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request