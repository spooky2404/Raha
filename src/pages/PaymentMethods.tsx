import { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Wallet, 
  Smartphone,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '@/src/components/Layout';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';

interface PaymentMethod {
  id: string;
  type: 'cash' | 'card' | 'wallet';
  label: string;
  details?: string;
  isDefault: boolean;
  icon: any;
}

export default function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { 
      id: '1', 
      type: 'cash', 
      label: 'Cash', 
      details: 'Pay at the end of the trip', 
      isDefault: true, 
      icon: Wallet 
    },
    { 
      id: '2', 
      type: 'card', 
      label: 'CIB / Edahabia', 
      details: '**** **** **** 4582', 
      isDefault: false, 
      icon: CreditCard 
    },
    { 
      id: '3', 
      type: 'wallet', 
      label: 'BaridiMob', 
      details: '00799999001234567890', 
      isDefault: false, 
      icon: Smartphone 
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const setDefault = (id: string) => {
    setMethods(methods.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
  };

  const removeMethod = (id: string) => {
    if (methods.find(m => m.id === id)?.type === 'cash') return;
    setMethods(methods.filter(m => m.id !== id));
  };

  return (
    <Layout title="Payment Methods" showBackButton={true}>
      <div className="p-6 max-w-lg mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Payment Methods</h1>
          <p className="text-slate-500 mt-1">Manage how you pay for your rides.</p>
        </div>

        <div className="space-y-4">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card 
                className={cn(
                  "p-4 transition-all border-2 cursor-pointer",
                  method.isDefault ? "border-emerald-500 bg-emerald-50/30" : "border-transparent hover:border-slate-200"
                )}
                onClick={() => setDefault(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center",
                      method.isDefault ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      <method.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{method.label}</h3>
                        {method.isDefault && (
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{method.details}</p>
                    </div>
                  </div>
                  
                  {method.type !== 'cash' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMethod(method.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                  
                  {method.isDefault && method.type === 'cash' && (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full h-14 border-dashed border-2 border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-5 w-5" />
          Add Payment Method
        </Button>

        <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 border border-blue-100">
          <Info className="h-5 w-5 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Your payment information is encrypted and secure. We support CIB, Edahabia, and cash payments for all rides in Algeria.
          </p>
        </div>
      </div>

      {/* Add Method Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed inset-x-0 bottom-0 z-[70] rounded-t-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200" />
              <h2 className="text-2xl font-black text-slate-900 mb-6">Add Payment Method</h2>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                <button className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 transition-all text-left">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Credit / Debit Card</p>
                    <p className="text-xs text-slate-500">CIB or Edahabia card</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 transition-all text-left">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">BaridiMob</p>
                    <p className="text-xs text-slate-500">Instant transfer via RIP</p>
                  </div>
                </button>
              </div>

              <Button className="w-full h-14" onClick={() => setShowAddModal(false)}>
                Continue
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
