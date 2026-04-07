export type UserRole = 'passenger' | 'driver' | 'admin';

export interface UserProfile {
  uid: string;
  phone: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: number;
  photoURL?: string;
}

export interface DriverProfile extends UserProfile {
  status: 'pending' | 'approved' | 'rejected';
  carModel: string;
  carColor: string;
  plateNumber: string;
  documents: {
    carFront: string;
    carBack: string;
    nationalId: string;
    licenseFront: string;
    licenseBack: string;
  };
  subscriptionExpiry?: number;
  isOnline: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId?: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  price: number;
  status: 'searching' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
}

export interface Subscription {
  driverId: string;
  startDate: number;
  endDate: number;
  active: boolean;
  amount: number;
}
