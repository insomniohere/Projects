'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Upload } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#05445E]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-white">Abyss</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Upload Button */}
            <Link
              href="/upload"
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Link>

            {/* User Menu */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                  userButtonPopoverCard: 'bg-[#0A4D68] border-white/20',
                  userButtonPopoverActionButton: 'text-white hover:bg-white/10',
                  userButtonPopoverActionButtonText: 'text-white',
                  userButtonPopoverFooter: 'hidden',
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
