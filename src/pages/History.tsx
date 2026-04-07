import { useState, useEffect } from 'react';
import { History as HistoryIcon, MapPin, Navigation, Clock, CreditCard, ChevronRight, Calendar } from 'lucide-react';
import Layout from '@/src/components/Layout';
import { Card } from '@/src/components/ui/Card';
import { formatCurrency, cn } from '@/src/lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function TripHistory() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'rides'),
      where('passengerId', '==', auth.currentUser.uid),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrips(tripsData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rides');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Layout title="Trip History" showBackButton={true}>
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <HistoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Trips</h2>
            <p className="text-slate-500">View your recent ride history</p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 w-full bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Calendar className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No trips yet</h3>
              <p className="text-slate-500">Your completed trips will appear here.</p>
            </div>
          ) : (
            trips.map((trip) => (
              <Card key={trip.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {trip.completedAt ? new Date(trip.completedAt).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                    trip.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  )}>
                    {trip.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-sm font-medium text-slate-800 truncate">{trip.pickup.address}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                    <p className="text-sm font-medium text-slate-800 truncate">{trip.destination.address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${trip.id}/100`} alt="Driver" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Driver</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(trip.price)}</p>
                    <p className="text-[10px] text-slate-400">Cash Payment</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
