import { Bell, Gift, Info, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import Layout from '@/src/components/Layout';
import { Card } from '@/src/components/ui/Card';

export default function Notifications() {
  const notifications = [
    {
      id: '1',
      type: 'promo',
      title: 'Ramadan Special Offer!',
      desc: 'Get 20% off your next 5 rides during this holy month. Use code RAMADAN20.',
      time: '2 hours ago',
      icon: Gift,
      color: 'bg-amber-100 text-amber-600'
    },
    {
      id: '2',
      type: 'info',
      title: 'New Feature: Multi-stop Rides',
      desc: 'You can now add up to 3 stops to your journey. Try it out on your next ride!',
      time: 'Yesterday',
      icon: Info,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: '3',
      type: 'system',
      title: 'Account Verified',
      desc: 'Your phone number has been successfully verified. Welcome to RAHHARIDE!',
      time: '2 days ago',
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-600'
    }
  ];

  return (
    <Layout title="Notifications" showBackButton={true}>
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
            <p className="text-slate-500">Stay updated with RAHHARIDE</p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.id} className="p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", notif.color)}>
                <notif.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">{notif.title}</h4>
                  <span className="text-[10px] font-medium text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{notif.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <Bell className="h-10 w-10" />
            </div>
            <p className="text-slate-500 font-medium">No notifications yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { cn } from '@/src/lib/utils';
