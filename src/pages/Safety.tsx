import { Shield, Phone, AlertCircle, MapPin, User, ChevronRight } from 'lucide-react';
import Layout from '@/src/components/Layout';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function Safety() {
  const safetyFeatures = [
    {
      icon: Phone,
      title: 'Emergency Contacts',
      desc: 'Share your trip status with trusted contacts automatically.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Shield,
      title: 'Safety Center',
      desc: 'Learn about our safety features and community guidelines.',
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      icon: MapPin,
      title: 'Share Trip Status',
      desc: 'Let friends and family follow your trip in real-time.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <Layout title="Safety" showBackButton={true}>
      <div className="p-6 space-y-8 max-w-lg mx-auto">
        <div className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-xl shadow-red-50">
            <Shield className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Safety Center</h2>
            <p className="text-slate-500">Your safety is our top priority at RAHHARIDE.</p>
          </div>
        </div>

        <Card className="bg-red-600 text-white p-6 border-none shadow-xl shadow-red-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Emergency SOS</h3>
              <p className="text-red-50 text-xs">Immediate assistance in case of emergency</p>
            </div>
          </div>
          <p className="text-red-50 text-sm mb-6 leading-relaxed">
            Pressing the SOS button will immediately notify our safety team and local authorities with your current location and trip details.
          </p>
          <Button className="w-full bg-white text-red-600 hover:bg-red-50 border-none h-14 text-lg font-black tracking-widest">
            CALL EMERGENCY (17/1548)
          </Button>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Safety Features</h3>
          {safetyFeatures.map((feature) => (
            <Card key={feature.title} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", feature.color)}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{feature.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </Card>
          ))}
        </div>

        <div className="p-6 bg-slate-100 rounded-2xl text-center">
          <p className="text-xs text-slate-500 leading-relaxed italic">
            "We verify every driver and vehicle to ensure you have a safe and comfortable journey every time you ride with RAHHARIDE."
          </p>
        </div>
      </div>
    </Layout>
  );
}

import { cn } from '@/src/lib/utils';
