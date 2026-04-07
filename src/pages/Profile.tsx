import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Bell, Settings, ChevronRight, LogOut, CreditCard, Car } from 'lucide-react';
import Layout from '@/src/components/Layout';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', value: `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Not set' },
        { icon: Mail, label: 'Email', value: auth.currentUser?.email || 'Not set' },
        { icon: Phone, label: 'Phone', value: userProfile?.phone || auth.currentUser?.phoneNumber || 'Not set' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'On' },
        { icon: Shield, label: 'Security & Privacy', value: '' },
        { icon: Settings, label: 'App Settings', value: '' },
      ]
    },
    {
      title: 'Payment',
      items: [
        { icon: CreditCard, label: 'Payment Methods', value: 'Cash' },
      ]
    }
  ];

  return (
    <Layout title="Profile" showBackButton={true}>
      <div className="p-6 space-y-8 max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={userProfile?.photoURL || "https://picsum.photos/seed/user/200"} 
                alt="Profile" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{userProfile?.firstName || 'User'}</h2>
            <p className="text-slate-500">Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : '2026'}</p>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              {section.title}
            </h3>
            <Card className="p-0 overflow-hidden divide-y divide-slate-100">
              {section.items.map((item) => (
                <button 
                  key={item.label}
                  className="flex w-full items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      {item.value && <p className="text-xs text-slate-500">{item.value}</p>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </button>
              ))}
            </Card>
          </div>
        ))}

        {/* Become a Driver CTA */}
        {userProfile?.role !== 'driver' && (
          <Card className="bg-emerald-600 text-white p-6 border-none shadow-xl shadow-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Car className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">
                Earn Money
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Drive with RAHHARIDE</h3>
            <p className="text-emerald-50 text-sm mb-6 leading-relaxed">
              Turn your car into an income source. Flexible hours, great earnings, and a supportive community.
            </p>
            <Button 
              className="w-full bg-white text-emerald-700 hover:bg-emerald-50 border-none h-12 font-bold"
              onClick={() => navigate('/driver/register')}
            >
              Apply Now
            </Button>
          </Card>
        )}

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </Layout>
  );
}
