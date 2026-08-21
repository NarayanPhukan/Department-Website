import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Subjects from './pages/Subjects';

import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Apply from './pages/Apply';
import Alumni from './pages/Alumni';
import Batches from './pages/Batches';
import CodingZone from './pages/CodingZone';
import StudentPanel from './pages/StudentPanel';
import ResetPassword from './pages/ResetPassword';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/coding-zone" element={<CodingZone />} />
        <Route path="/student-panel" element={<StudentPanel />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
