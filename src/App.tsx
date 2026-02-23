/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Goals } from './pages/Goals';
import { Stats } from './pages/Stats';
import { Focus } from './pages/Focus';
import { Settings } from './pages/Settings';
import { Medals } from './pages/Medals';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="goals" element={<Goals />} />
            <Route path="stats" element={<Stats />} />
            <Route path="focus" element={<Focus />} />
            <Route path="settings" element={<Settings />} />
            <Route path="medals" element={<Medals />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
