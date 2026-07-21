import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070c18] text-white">
      {children}
    </div>
  );
}