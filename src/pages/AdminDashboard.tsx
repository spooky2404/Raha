import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Car, 
  FileText, 
  ShieldCheck, 
  Clock,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '@/src/components/Layout';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface DriverApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  carModel: string;
  carColor: string;
  plateNumber: string;
  documents: Record<string, string>;
  createdAt: number;
  user?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedApp, setSelectedApp] = useState<DriverApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      
      const isSystemAdmin = auth.currentUser.email === 'davidhdd90@gmail.com';
      
      if (userData?.role === 'admin' || isSystemAdmin) {
        setIsAdmin(true);
      } else {
        navigate('/home');
      }
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'drivers'), where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const apps: DriverApplication[] = [];
      
      for (const driverDoc of snapshot.docs) {
        const driverData = driverDoc.data() as DriverApplication;
        // Fetch user info for each driver
        const userDoc = await getDoc(doc(db, 'users', driverDoc.id));
        const userData = userDoc.data();
        
        apps.push({
          ...driverData,
          id: driverDoc.id,
          user: userData as any
        });
      }
      
      setApplications(apps.sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'drivers');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleUpdateStatus = async (driverId: string, newStatus: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'drivers', driverId), {
        status: newStatus
      });
      
      // If approved, update user role to driver
      if (newStatus === 'approved') {
        await updateDoc(doc(db, 'users', driverId), {
          role: 'driver'
        });
      }
      
      setSelectedApp(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `drivers/${driverId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAdmin && !isLoading) return null;

  return (
    <Layout title="Admin Panel" showBackButton={true}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            Driver Approvals
          </h1>
          <p className="text-slate-500 mt-2">Review and verify new driver applications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats */}
          <Card className="p-4 bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-black text-emerald-900">{applications.length}</p>
              </div>
            </div>
          </Card>
          
          <div className="md:col-span-2 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search drivers..." 
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <Button variant="outline" className="h-12 w-12 p-0">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg">All caught up!</p>
              <p className="text-slate-400 text-sm">No pending applications at the moment.</p>
            </div>
          ) : (
            applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className={cn(
                    "p-4 hover:shadow-md transition-all cursor-pointer border-l-4",
                    selectedApp?.id === app.id ? "border-l-emerald-600 bg-emerald-50/30" : "border-l-transparent"
                  )}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {app.user?.firstName} {app.user?.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Car className="h-3 w-3" /> {app.carModel} • {app.plateNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        Pending
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedApp(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">Application Details</h2>
                <button onClick={() => setSelectedApp(null)} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                    <p className="font-bold text-slate-900">{selectedApp.user?.firstName} {selectedApp.user?.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="font-bold text-slate-900">{selectedApp.user?.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</p>
                    <p className="font-bold text-slate-900">{selectedApp.carModel} ({selectedApp.carColor})</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plate Number</p>
                    <p className="font-bold text-slate-900">{selectedApp.plateNumber}</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Submitted Documents
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(selectedApp.documents).map(([key, url]) => (
                      <div key={key} className="space-y-2">
                        <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          <img 
                            src={url} 
                            alt={key} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 capitalize text-center">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                  isLoading={isProcessing}
                >
                  Reject
                </Button>
                <Button 
                  className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                  isLoading={isProcessing}
                >
                  Approve Driver
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
