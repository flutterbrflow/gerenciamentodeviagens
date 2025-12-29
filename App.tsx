
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import TripDetailsScreen from './screens/TripDetailsScreen';
import NewTripScreen from './screens/NewTripScreen';
import BudgetScreen from './screens/BudgetScreen';
import MemoriesScreen from './screens/MemoriesScreen';
import ProfileScreen from './screens/ProfileScreen';
import BookingsScreen from './screens/BookingsScreen';
import NewBookingScreen from './screens/NewBookingScreen';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center bg-gray-200 dark:bg-black">
      {/* Mobile Frame Container */}
      <div className="relative w-full max-w-[430px] h-[100dvh] bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl">
        <HashRouter>
          <Routes>
            <Route path="/" element={<OnboardingScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/bookings" element={<BookingsScreen />} />
            <Route path="/new-booking" element={<NewBookingScreen />} />
            <Route path="/trip/:id" element={<TripDetailsScreen />} />
            <Route path="/trip/:id/bookings" element={<BookingsScreen />} />
            <Route path="/new-trip" element={<NewTripScreen />} />
            <Route path="/budget" element={<BudgetScreen />} />
            <Route path="/memories" element={<MemoriesScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </div>
    </div>
  );
};

export default App;
