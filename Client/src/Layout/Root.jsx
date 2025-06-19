import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Root = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Root;
