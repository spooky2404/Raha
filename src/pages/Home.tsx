import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Clock, CreditCard, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '@/src/components/Layout';
import Map from '@/src/components/Map';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { formatCurrency, cn } from '@/src/lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  updateDoc, 
  getDocs,
  limit
} from 'firebase/firestore';

export default function Home() {
  const [destination, setDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [rideStep, setRideStep] = useState<'search' | 'confirm' | 'tracking'>('search');
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [rideData, setRideData] = useState<any>(null);

  // Listen for online drivers
  useEffect(() => {
    const q = query(
      collection(db, 'drivers'),
      where('isOnline', '==', true),
      where('status', '==', 'approved'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailableDrivers(drivers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'drivers');
    });

    return () => unsubscribe();
  }, []);

  // Listen for current ride updates
  useEffect(() => {
    if (!currentRideId) return;

    const unsubscribe = onSnapshot(doc(db, 'rides', currentRideId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRideData(data);
        if (data.status === 'accepted') {
          setRideStep('tracking');
          // Find driver details
          const driver = availableDrivers.find(d => d.id === data.driverId);
          if (driver) setSelectedRide(driver);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rides/${currentRideId}`);
    });

    return () => unsubscribe();
  }, [currentRideId, availableDrivers]);

  const handleDestinationSelect = async (addr: string) => {
    setDestination(addr);
    setIsSearching(false);
    setRideStep('confirm');
  };

  const handleRequestRide = async () => {
    if (!auth.currentUser) return;
    
    setIsSearching(true);
    try {
      const rideRef = await addDoc(collection(db, 'rides'), {
        passengerId: auth.currentUser.uid,
        passengerName: auth.currentUser.displayName || 'Passenger',
        pickup: { address: 'Current Location', lat: 36.7538, lng: 3.0588 },
        destination: { address: destination, lat: 36.75, lng: 3.06 },
        price: selectedRide?.price || 450,
        status: 'searching',
        createdAt: Date.now()
      });
      setCurrentRideId(rideRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'rides');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelRide = async () => {
    if (!currentRideId) return;
    try {
      await updateDoc(doc(db, 'rides', currentRideId), {
        status: 'cancelled'
      });
      setRideStep('search');
      setCurrentRideId(null);
      setRideData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rides/${currentRideId}`);
    }
  };

  const mockDrivers = [
    { id: '1', name: 'Ahmed B.', car: 'Dacia Logan', plate: '12345-120-16', eta: '3 min', price: 450, rating: 4.8 },
    { id: '2', name: 'Karim S.', car: 'Renault Symbol', plate: '67890-121-16', eta: '5 min', price: 520, rating: 4.9 },
    { id: '3', name: 'Yacine M.', car: 'Volkswagen Golf', plate: '11223-122-16', eta: '8 min', price: 680, rating: 4.7 },
  ];

  return (
    <Layout>
      <div className="relative h-full w-full">
        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <Map 
            center={[36.7538, 3.0588]} 
            zoom={14} 
            showUserLocation={true}
            markers={availableDrivers.map(d => ({
              id: d.id,
              position: [d.currentLocation?.lat || 36.75, d.currentLocation?.lng || 3.05],
              title: d.carModel
            }))}
          />
        </div>

        {/* Overlay UI */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <AnimatePresence mode="wait">
            {rideStep === 'search' && (
              <motion.div
                key="search"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="space-y-4"
              >
                <Card className="p-6 shadow-2xl">
                  <h2 className="mb-4 text-xl font-bold text-slate-900">Where to?</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Enter destination"
                      className="pl-10"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onFocus={() => setIsSearching(true)}
                    />
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <button 
                      onClick={() => handleDestinationSelect('Place Audin, Alger')}
                      className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-800">Place Audin</p>
                        <p className="text-xs text-slate-500">Alger Centre, Alger</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleDestinationSelect('Aéroport Houari Boumédiène')}
                      className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-800">Aéroport d'Alger</p>
                        <p className="text-xs text-slate-500">Dar El Beïda, Alger</p>
                      </div>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {rideStep === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="space-y-4"
              >
                <Card className="p-0 overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-slate-800">Available Rides</span>
                    </div>
                    <button onClick={() => setRideStep('search')} className="p-1 hover:bg-slate-100 rounded-full">
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto p-2">
                    {mockDrivers.map((driver) => (
                      <button
                        key={driver.id}
                        onClick={() => setSelectedRide(driver)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl p-4 transition-all",
                          selectedRide?.id === driver.id ? "bg-emerald-50 ring-1 ring-emerald-500" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${driver.id}/100`} alt={driver.name} referrerPolicy="no-referrer" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900">{driver.name}</p>
                            <p className="text-xs text-slate-500">{driver.car} • {driver.eta}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-700">{formatCurrency(driver.price)}</p>
                          <p className="text-xs text-slate-400">★ {driver.rating}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50">
                    <Button 
                      className="w-full h-12 text-lg font-bold" 
                      disabled={!selectedRide}
                      onClick={handleRequestRide}
                      isLoading={isSearching}
                    >
                      {currentRideId ? 'Searching for Driver...' : 'Confirm RAHHARIDE'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {rideStep === 'tracking' && (
              <motion.div
                key="tracking"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="space-y-4"
              >
                <Card className="p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-medium text-emerald-600">
                        {rideData?.status === 'accepted' ? 'Driver is arriving' : 
                         rideData?.status === 'arrived' ? 'Driver has arrived' :
                         rideData?.status === 'in_progress' ? 'Trip in progress' : 'Trip status'}
                      </p>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedRide?.eta || '3 min'}</h2>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-emerald-600 animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                    <div className="h-14 w-14 rounded-full bg-slate-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${selectedRide?.id}/100`} alt={selectedRide?.name} referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{selectedRide?.name}</p>
                      <p className="text-sm text-slate-500">{selectedRide?.car} • {selectedRide?.plate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">{formatCurrency(selectedRide?.price || 0)}</p>
                      <p className="text-xs text-slate-400">Cash Payment</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleCancelRide}>
                      Cancel Ride
                    </Button>
                    <Button variant="secondary" className="flex-1">
                      Safety SOS
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Destination Search Modal (Full Screen) */}
        <AnimatePresence>
          {isSearching && !currentRideId && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-0 z-[100] bg-white p-4"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setIsSearching(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <ChevronRight className="h-6 w-6 rotate-180" />
                </button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    autoFocus
                    placeholder="Where to?"
                    className="pl-10"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Recent Places</p>
                <button 
                  onClick={() => handleDestinationSelect('Place Audin, Alger')}
                  className="flex w-full items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Place Audin</p>
                    <p className="text-sm text-slate-500">Alger Centre, Alger</p>
                  </div>
                </button>
                <button 
                  onClick={() => handleDestinationSelect('Aéroport Houari Boumédiène')}
                  className="flex w-full items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Aéroport d'Alger</p>
                    <p className="text-sm text-slate-500">Dar El Beïda, Alger</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
