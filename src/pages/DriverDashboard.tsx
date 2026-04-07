import { useState, useEffect } from 'react';
import { Power, MapPin, Navigation, Clock, DollarSign, User, Star, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '@/src/components/Layout';
import Map from '@/src/components/Map';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { formatCurrency, cn } from '@/src/lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  query, 
  where, 
  limit,
  getDoc
} from 'firebase/firestore';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState<any>(null);
  const [rideStatus, setRideStatus] = useState<'idle' | 'accepted' | 'arrived' | 'in_progress' | 'completed'>('idle');
  const [activeRideId, setActiveRideId] = useState<string | null>(null);

  // Listen for driver profile
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'drivers', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDriverProfile(data);
        setIsOnline(data.isOnline);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `drivers/${auth.currentUser?.uid}`);
    });

    return () => unsubscribe();
  }, []);

  // Listen for ride requests when online
  useEffect(() => {
    if (!isOnline || !auth.currentUser || rideStatus !== 'idle') return;

    const q = query(
      collection(db, 'rides'),
      where('status', '==', 'searching'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const ride = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setCurrentRideRequest(ride);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rides');
    });

    return () => unsubscribe();
  }, [isOnline, rideStatus]);

  // Listen for active ride updates
  useEffect(() => {
    if (!activeRideId) return;

    const unsubscribe = onSnapshot(doc(db, 'rides', activeRideId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === 'cancelled') {
          setRideStatus('idle');
          setActiveRideId(null);
          setCurrentRideRequest(null);
        }
      }
    });

    return () => unsubscribe();
  }, [activeRideId]);

  const handleToggleOnline = async () => {
    if (!auth.currentUser) return;

    if (driverProfile?.status !== 'approved') {
      alert('Your account is pending approval.');
      return;
    }

    const isSubscribed = driverProfile?.subscriptionExpiry && driverProfile.subscriptionExpiry > Date.now();
    if (!isSubscribed) {
      setShowSubscriptionModal(true);
      return;
    }

    try {
      let location = { lat: 36.7538, lng: 3.0588 }; // Default Alger location

      if (!isOnline) {
        // Try to get real location when going online
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
          console.warn('Geolocation failed, using default', e);
        }
      }

      await updateDoc(doc(db, 'drivers', auth.currentUser.uid), {
        isOnline: !isOnline,
        currentLocation: location
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `drivers/${auth.currentUser.uid}`);
    }
  };

  const handleAcceptRide = async () => {
    if (!currentRideRequest || !auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'rides', currentRideRequest.id), {
        status: 'accepted',
        driverId: auth.currentUser.uid,
        acceptedAt: Date.now()
      });
      setActiveRideId(currentRideRequest.id);
      setRideStatus('accepted');
      setCurrentRideRequest(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rides/${currentRideRequest.id}`);
    }
  };

  const handleUpdateRideStatus = async (newStatus: any) => {
    if (!activeRideId) return;
    try {
      await updateDoc(doc(db, 'rides', activeRideId), {
        status: newStatus,
        ...(newStatus === 'completed' ? { completedAt: Date.now() } : {})
      });
      setRideStatus(newStatus);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rides/${activeRideId}`);
    }
  };

  const handlePaySubscription = async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'drivers', auth.currentUser.uid), {
        subscriptionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000
      });
      setShowSubscriptionModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `drivers/${auth.currentUser.uid}`);
    }
  };

  return (
    <Layout role="driver" title="Driver Dashboard">
      <div className="relative h-full w-full">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <Map 
            center={[36.7538, 3.0588]} 
            zoom={14} 
            showUserLocation={true}
          />
        </div>

        {/* Top Status Bar */}
        <div className="absolute inset-x-0 top-4 z-10 px-4">
          <Card className="flex items-center justify-between p-4 shadow-lg border-none bg-white/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-3 w-3 rounded-full animate-pulse",
                isOnline ? "bg-emerald-500" : "bg-slate-400"
              )} />
              <span className="font-bold text-slate-800">
                {isOnline ? "YOU ARE ONLINE" : "OFFLINE"}
              </span>
            </div>
            <button 
              onClick={handleToggleOnline}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-all shadow-md",
                isOnline ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
              )}
            >
              <Power className="h-6 w-6" />
            </button>
          </Card>
        </div>

        {/* Bottom UI */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <AnimatePresence mode="wait">
            {/* Idle Stats */}
            {rideStatus === 'idle' && !currentRideRequest && (
              <motion.div
                key="stats"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="grid grid-cols-3 gap-3"
              >
                <Card className="flex flex-col items-center justify-center p-4 text-center">
                  <Clock className="h-5 w-5 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">Hours</p>
                  <p className="font-bold text-slate-900">4.5</p>
                </Card>
                <Card className="flex flex-col items-center justify-center p-4 text-center">
                  <DollarSign className="h-5 w-5 text-emerald-600 mb-1" />
                  <p className="text-xs text-slate-500">Earnings</p>
                  <p className="font-bold text-slate-900">3,450 DA</p>
                </Card>
                <Card className="flex flex-col items-center justify-center p-4 text-center">
                  <Navigation className="h-5 w-5 text-blue-500 mb-1" />
                  <p className="text-xs text-slate-500">Rides</p>
                  <p className="font-bold text-slate-900">8</p>
                </Card>
              </motion.div>
            )}

            {/* Ride Request Modal */}
            {currentRideRequest && (
              <motion.div
                key="request"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="space-y-4"
              >
                <Card className="p-6 shadow-2xl border-emerald-500 border-2 bg-white/95 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                        <img src="https://picsum.photos/seed/passenger/100" alt="Passenger" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{currentRideRequest.passengerName}</h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">{formatCurrency(currentRideRequest.price)}</p>
                      <p className="text-xs text-slate-400">18.5 km</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pickup</p>
                        <p className="text-sm font-medium text-slate-800">{currentRideRequest.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Destination</p>
                        <p className="text-sm font-medium text-slate-800">{currentRideRequest.destination.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12" onClick={() => setCurrentRideRequest(null)}>
                      Decline
                    </Button>
                    <Button className="flex-[2] h-12 text-lg font-bold" onClick={handleAcceptRide}>
                      Accept Ride
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Active Ride Controls */}
            {rideStatus !== 'idle' && rideStatus !== 'completed' && (
              <motion.div
                key="active"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="space-y-4"
              >
                <Card className="p-6 shadow-2xl bg-slate-900 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Current Trip</p>
                      <h3 className="text-xl font-bold">Sarah K.</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-emerald-400 font-bold">1,200 DA</p>
                      <p className="text-xs text-slate-400">Cash</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 rounded-xl bg-slate-800 p-3 flex items-center gap-3">
                      <Navigation className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">ETA</p>
                        <p className="text-sm font-bold">12 min</p>
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl bg-slate-800 p-3 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-red-400" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">Distance</p>
                        <p className="text-sm font-bold">4.2 km</p>
                      </div>
                    </div>
                  </div>

                  {rideStatus === 'accepted' && (
                    <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600" onClick={() => handleUpdateRideStatus('arrived')}>
                      I Have Arrived
                    </Button>
                  )}
                  {rideStatus === 'arrived' && (
                    <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600" onClick={() => handleUpdateRideStatus('in_progress')}>
                      Start Trip
                    </Button>
                  )}
                  {rideStatus === 'in_progress' && (
                    <Button className="w-full h-12 bg-red-500 hover:bg-red-600" onClick={() => handleUpdateRideStatus('completed')}>
                      Complete Trip
                    </Button>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Completion Success */}
            {rideStatus === 'completed' && (
              <motion.div
                key="completed"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <Card className="p-8 text-center shadow-2xl">
                  <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Trip Completed!</h2>
                  <p className="text-slate-500 mb-6">You earned 1,200 DA from this trip.</p>
                  <Button className="w-full h-12" onClick={() => setRideStatus('idle')}>
                    Back to Dashboard
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subscription Modal */}
        <AnimatePresence>
          {showSubscriptionModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSubscriptionModal(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl bg-white p-8 shadow-2xl"
              >
                <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200" />
                <div className="text-center space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Subscription Required</h2>
                  <p className="text-slate-500">To go online and receive rides, you need an active monthly subscription.</p>
                  
                  <Card className="bg-slate-50 border-slate-200 p-6 my-6">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Monthly Plan</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-black text-slate-900">280</span>
                      <span className="text-xl font-bold text-slate-500">DZD</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Valid for 30 days • Unlimited rides</p>
                  </Card>

                  <div className="space-y-3">
                    <Button className="w-full h-14 text-lg font-bold" onClick={handlePaySubscription}>
                      Pay with BaridiMob / CIB (Mock)
                    </Button>
                    <button 
                      onClick={() => setShowSubscriptionModal(false)}
                      className="text-sm font-medium text-slate-400 hover:text-slate-600"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
