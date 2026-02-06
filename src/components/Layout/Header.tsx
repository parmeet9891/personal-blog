import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-gray-800">
      <div className="content-container">
        <div className="flex items-center justify-between py-4">
          {/* User image on the left */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-700">
              <Image
                src="/profile.jpg"
                alt="Parmeet"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Navigation items on the right */}
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-white hover:text-gray-300 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/blog" 
              className="text-white hover:text-gray-300 transition-colors"
            >
              Blog
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}