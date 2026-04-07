import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, History, Shield, Bell, LogOut, Car, ChevronLeft, MoreVertical, ShieldCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Button } from './ui/Button';
import { auth, db } from '@/src/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  role?: 'passenger' | 'driver';
}

export default function Layout({ children, title, showBackButton, role = 'passenger' }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        if (auth.currentUser.email === 'davidhdd90@gmail.com') {
          setIsAdmin(true);
          return;
        }
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();
  }, []);

  const menuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: CreditCard, label: 'Payment Methods', path: '/payment' },
    { icon: History, label: 'Trip History', path: '/history' },
    { icon: Shield, label: 'Safety', path: '/safety' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: ShieldCheck, label: 'Admin Panel', path: '/admin' });
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-50 font-sans">
      {/* Header */}
      <header className="z-50 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100">
              <ChevronLeft className="h-6 w-6 text-slate-700" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                R
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">RAHHARIDE</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {title && <h1 className="text-lg font-semibold text-slate-800">{title}</h1>}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <MoreVertical className="h-6 w-6 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[70] h-full w-4/5 max-w-sm bg-white p-6 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden">
                    <img 
                      src={auth.currentUser?.photoURL || "https://picsum.photos/seed/user/200"} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {auth.currentUser?.displayName || 'User'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {auth.currentUser?.phoneNumber || auth.currentUser?.email}
                    </p>
                  </div>
                </div>

                <nav className="flex-1 space-y-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl p-4 text-slate-700 transition-colors hover:bg-slate-50",
                        location.pathname === item.path && "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto space-y-4 pt-6 border-t border-slate-100">
                  <Button
                    variant={role === 'passenger' ? 'secondary' : 'primary'}
                    className="w-full justify-start gap-4"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(role === 'passenger' ? '/driver/dashboard' : '/');
                    }}
                  >
                    <Car className="h-5 w-5" />
                    <span>Switch to {role === 'passenger' ? 'Driver' : 'Passenger'} Mode</span>
                  </Button>
                  
                  <button 
                    onClick={async () => {
                      await auth.signOut();
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-4 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
