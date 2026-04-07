import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from '@/src/components/Layout';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

export default function DriverRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    carModel: '',
    carColor: '',
    plateNumber: '',
  });
  const [documents, setDocuments] = useState<Record<string, { file: File | null, url: string, uploading: boolean }>>({
    licenseFront: { file: null, url: '', uploading: false },
    licenseBack: { file: null, url: '', uploading: false },
    nationalId: { file: null, url: '', uploading: false },
    carFront: { file: null, url: '', uploading: false },
    carBack: { file: null, url: '', uploading: false },
    vehicleDocs: { file: null, url: '', uploading: false },
  });
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleFileSelect = (key: string) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { ...prev[key], uploading: true }
    }));

    // Simulate a short upload delay for the demo
    setTimeout(() => {
      const demoUrls: Record<string, string> = {
        licenseFront: 'https://picsum.photos/seed/licfront/800/600',
        licenseBack: 'https://picsum.photos/seed/licback/800/600',
        nationalId: 'https://picsum.photos/seed/id/800/600',
        carFront: 'https://picsum.photos/seed/carfront/800/600',
        carBack: 'https://picsum.photos/seed/carback/800/600',
        vehicleDocs: 'https://picsum.photos/seed/vehdocs/800/600',
      };

      setDocuments(prev => ({
        ...prev,
        [key]: { file: null, url: demoUrls[key], uploading: false }
      }));
    }, 800);
  };

  const handleFileChange = () => {
    // No longer used in demo mode
  };

  const handleSubmit = async () => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    
    if (!auth.currentUser && !isDemoMode) {
      alert('You must be logged in to submit an application.');
      return;
    }
    
    // Check if all required documents are uploaded
    const missingDocs = Object.entries(documents).filter(([key, val]) => {
      const docVal = val as { url: string };
      return !docVal.url && key !== 'vehicleDocs';
    });
    
    if (missingDocs.length > 0) {
      alert('Please click on each document to "upload" it (demo mode) before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemoMode && !auth.currentUser) {
        // Simulate a delay and success for demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep(4);
        return;
      }

      if (!auth.currentUser) return;

      // Update user personal info (but NOT role, as rules forbid self-escalation)
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Create driver profile
      await setDoc(doc(db, 'drivers', auth.currentUser.uid), {
        status: 'pending',
        carModel: formData.carModel,
        carColor: formData.carColor,
        plateNumber: formData.plateNumber,
        isOnline: false,
        documents: {
          carFront: documents.carFront.url,
          carBack: documents.carBack.url,
          nationalId: documents.nationalId.url,
          licenseFront: documents.licenseFront.url,
          licenseBack: documents.licenseBack.url,
          vehicleDocs: documents.vehicleDocs.url,
        },
        createdAt: Date.now()
      });

      setStep(4);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `drivers/${auth.currentUser.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Become a Driver" showBackButton={true}>
      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-8 flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={cn(
                "h-2 flex-1 rounded-full mx-1 transition-all",
                step >= s ? "bg-emerald-600" : "bg-slate-200"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                <p className="text-slate-500">Tell us who you are to get started.</p>
              </div>

              <div className="space-y-4">
                <Input 
                  label="First Name" 
                  placeholder="e.g. Ahmed" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input 
                  label="Last Name" 
                  placeholder="e.g. Belkacem" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
                <Input 
                  label="National ID Number" 
                  placeholder="1234567890" 
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                />
              </div>

              <Button className="w-full h-12" onClick={handleNext} disabled={!formData.firstName || !formData.lastName}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Vehicle Details</h2>
                <p className="text-slate-500">Enter your car information.</p>
              </div>

              <div className="space-y-4">
                <Input 
                  label="Car Brand & Model" 
                  placeholder="e.g. Dacia Logan" 
                  value={formData.carModel}
                  onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                />
                <Input 
                  label="Car Color" 
                  placeholder="e.g. White" 
                  value={formData.carColor}
                  onChange={(e) => setFormData({ ...formData, carColor: e.target.value })}
                />
                <Input 
                  label="License Plate Number" 
                  placeholder="e.g. 12345-120-16" 
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={handlePrev}>
                  Back
                </Button>
                <Button className="flex-[2] h-12" onClick={handleNext} disabled={!formData.carModel || !formData.plateNumber}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Upload Documents</h2>
                <p className="text-slate-500">We need clear photos of your documents.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'licenseFront', label: 'License Front', icon: FileText },
                  { key: 'licenseBack', label: 'License Back', icon: FileText },
                  { key: 'nationalId', label: 'National ID', icon: UserIcon },
                  { key: 'carFront', label: 'Car Front', icon: Camera },
                  { key: 'carBack', label: 'Car Back', icon: Camera },
                  { key: 'vehicleDocs', label: 'Vehicle Docs', icon: FileText },
                ].map((docItem) => {
                  const docState = documents[docItem.key] as { file: File | null, url: string, uploading: boolean };
                  return (
                    <button 
                      key={docItem.key}
                      onClick={() => handleFileSelect(docItem.key)}
                      disabled={docState.uploading}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all relative overflow-hidden",
                        docState.url 
                          ? "border-emerald-500 bg-emerald-50" 
                          : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                      )}
                    >
                      {docState.uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                        </div>
                      )}
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                        docState.url ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {docState.url ? <CheckCircle className="h-5 w-5" /> : <docItem.icon className="h-5 w-5" />}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{docItem.label}</span>
                      {!docState.url && <Upload className="h-4 w-4 text-slate-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={handlePrev}>
                  Back
                </Button>
                <Button 
                  className="flex-[2] h-12" 
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                >
                  Submit Application
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-12"
            >
              <div className="mx-auto h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
                <p className="text-slate-500">Our team will review your documents within 24-48 hours. You'll be notified once approved.</p>
              </div>
              <Button className="w-full h-12" onClick={() => navigate('/home')}>
                Back to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <Card className="mt-12 bg-emerald-50 border-emerald-100 p-4 flex gap-4 items-start">
            <AlertCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              By submitting, you agree to RAHHARIDE's Driver Terms of Service and Privacy Policy. Your data is encrypted and stored securely.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
