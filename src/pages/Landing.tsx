import { useNavigate } from 'react-router-dom';
import { Car, User, Shield, Clock, MapPin, ChevronRight, Star, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: Shield, title: 'Safe & Secure', desc: 'Verified drivers and 24/7 safety monitoring.' },
    { icon: Clock, title: 'Fast Pickup', desc: 'Average pickup time under 5 minutes in Algiers.' },
    { icon: MapPin, title: 'Live Tracking', desc: 'Follow your ride in real-time on the map.' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-600 text-5xl font-black text-white shadow-2xl shadow-emerald-200"
          >
            R
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6"
          >
            RAHHA<span className="text-emerald-600">RIDE</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the future of ride-hailing in Algeria. Premium service, professional drivers, and unbeatable reliability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="h-16 px-10 text-xl font-bold shadow-xl shadow-emerald-100"
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 px-10 text-xl font-bold"
              onClick={() => navigate('/driver/register')}
            >
              Drive with us
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Why choose RAHHARIDE?</h2>
            <p className="text-slate-500">Built for Algerians, by Algerians.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-shadow border-none">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-slate-900 text-white p-12 md:p-20 border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Start earning with your car today.
                </h2>
                <p className="text-slate-400 text-lg">
                  Join our community of professional drivers and enjoy flexible hours, competitive earnings, and 24/7 support.
                </p>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium">280 DZD Monthly Subscription</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium">Keep 100% of your ride earnings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium">Instant Payouts</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="bg-emerald-500 hover:bg-emerald-600 h-16 px-10 text-xl font-bold mt-4"
                  onClick={() => navigate('/driver/register')}
                >
                  Apply to Drive
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                  <img 
                    src="https://picsum.photos/seed/car/800/600" 
                    alt="Car" 
                    className="rounded-3xl shadow-2xl relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              R
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">RAHHARIDE</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">About</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Safety</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
          </div>
          
          <p className="text-sm text-slate-400">
            © 2026 RAHHARIDE. All rights reserved. Made in Algeria.
          </p>
        </div>
      </footer>
    </div>
  );
}
