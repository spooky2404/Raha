import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { auth, db, handleFirestoreError, OperationType } from '@/src/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Recaptcha
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);

  const handleSendOtp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+213${phone}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      if (err.code === 'auth/operation-not-allowed') {
        if (err.message.includes('region')) {
          setError('SMS are restricted for Algeria (+213). Please enable this region in Firebase Console (Authentication > Settings > SMS Region Policy).');
        } else {
          setError('Phone Authentication is not enabled. Please enable it in the Firebase Console (Authentication > Sign-in method).');
        }
      } else {
        setError('Failed to send OTP. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!confirmationResult) throw new Error('No confirmation result');
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          phone: user.phoneNumber,
          role: 'passenger',
          createdAt: Date.now()
        });
      }

      navigate('/home');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          phone: user.phoneNumber || '',
          role: 'passenger',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: user.photoURL || '',
          createdAt: Date.now()
        });
      }
      navigate('/home');
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code === 'permission-denied') {
        setError('Login successful, but profile creation failed. Please check Firestore rules.');
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 p-6 font-sans">
      <div id="recaptcha-container"></div>
      <div className="flex flex-1 flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 text-4xl font-black text-white shadow-xl shadow-emerald-200">
            R
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">RAHHARIDE</h1>
          <p className="text-slate-500 mt-2">Your premium ride-hailing partner in Algeria</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
                <p className="text-sm text-slate-500">Enter your phone number to continue.</p>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-3">
                  <span className="text-sm font-bold text-slate-600">+213</span>
                </div>
                <Input
                  type="tel"
                  placeholder="555 123 456"
                  className="pl-20 h-14 text-lg font-medium tracking-widest"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <Button 
                className="w-full h-14 text-lg font-bold shadow-lg shadow-emerald-100" 
                onClick={handleSendOtp}
                isLoading={isLoading}
                disabled={!phone}
              >
                Send Verification Code
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-14 text-lg font-bold border-emerald-200 text-emerald-700 bg-emerald-50/50"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    localStorage.setItem('isDemoMode', 'true');
                    navigate('/home');
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Try Demo Mode (Bypass SMS)
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-2 text-slate-400">Or continue with</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 text-lg font-bold"
                onClick={handleGoogleLogin}
                isLoading={isLoading}
              >
                Google Account
              </Button>

              <p className="text-center text-xs text-slate-400">
                By continuing, you agree to our Terms of Service and Privacy Policy. Standard SMS rates may apply.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800">Verify Code</h2>
                <p className="text-sm text-slate-500">We sent a 6-digit code to +213 {phone}</p>
              </div>

              <div className="flex justify-between gap-2">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  className="h-16 text-center text-3xl font-black tracking-[0.5em] placeholder:tracking-normal"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <Button 
                className="w-full h-14 text-lg font-bold shadow-lg shadow-emerald-100" 
                onClick={handleVerifyOtp}
                isLoading={isLoading}
                disabled={otp.length !== 6}
              >
                Verify & Login
              </Button>

              <div className="text-center">
                <button 
                  onClick={() => setStep('phone')}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Change phone number
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto py-8 text-center">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Algeria's #1 VTC Platform</p>
      </div>
    </div>
  );
}
