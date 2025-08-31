'use client';

import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src="https://ik.imagekit.io/ma8j7tc4p/1000422795.png?updatedAt=1756677286326"
            alt="Founders Hub Logo"
            width={180}
            height={32}
            priority
          />
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Home
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button asChild>
            <Link href="/organizer-login">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Organizer Login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
