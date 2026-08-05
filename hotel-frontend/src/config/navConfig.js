import React from 'react';
import { Home, Info, CalendarDays, Shield } from 'lucide-react';

/**
 * Navigation items configuration for BookInn.
 * Provides a single source of truth for navigation links
 * rendered across desktop and mobile headers.
 */

export const getNavItems = ({ isLoggedIn, isAdmin }) => {
  const items = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      requiresAuth: false,
      showAlways: true,
    },
  ];

  if (isLoggedIn && !isAdmin) {
    items.push({
      label: 'My Bookings',
      path: '/bookings',
      icon: CalendarDays,
      requiresAuth: true,
      userOnly: true,
    });
  }

  if (isLoggedIn && isAdmin) {
    items.push({
      label: 'All Bookings',
      path: '/admin',
      icon: Shield,
      requiresAuth: true,
      adminOnly: true,
    });
  }

  items.push({
    label: 'About Us',
    path: '/about',
    icon: Info,
    requiresAuth: false,
    showAlways: true,
  });

  return items;
};
