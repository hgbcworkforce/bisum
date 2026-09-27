export interface SpeakerSocial {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  github?: string;
  website?: string;
}

export interface Speaker {
  id: number | string;
  name: string;
  title: string;
  company: string;
  bio: string;
  image: string;
  expertise: string[];
  category: string | string[];
  experience?: string;
  achievements?: string[];
  quote?: string;
  featured?: boolean;
  social?: SpeakerSocial;
}

export interface SessionSpeaker {
  name: string;
  title?: string;
  avatar?: string;
}

export interface Session {
  id: number | string;
  day: string;
  time: string;
  endTime?: string;
  title: string;
  type: string;
  speaker: SessionSpeaker;
  venue: string;
  description?: string;
}

export interface MerchandiseColor {
  name: string;
  image: string;
}

export interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: string;
  timeFrame: string;
  fullDescription: string;
  colors: MerchandiseColor[];
  sizes: string[];
}

export interface Attendee {
  id?: string;
  registrationNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  ageRange?: string;
  referralSource?: string;
  breakoutSessionChoice?: string;
  attendanceMode?: string;
  expectations?: string;
  registrationType: string;
  createdAt?: string;
  amountPaid?: number;
  paymentStatus?: string;
  paymentReference?: string;
}

export interface MerchandiseOrder {
  id?: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemId: string;
  itemName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  pickupOption?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  fulfillmentStatus?: 'unfulfilled' | 'ready' | 'picked_up';
  paymentReference?: string;
  emailSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id?: string;
  transaction_reference: string;
  reference?: string;
  customer_name?: string;
  customer_email: string;
  amount: number;
  currency?: string;
  status: string;
  channel?: string;
  metadata?: any;
  paid_at?: string;
  created_at: string;
}

export interface AdminUser {
  id?: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_approved: boolean;
  is_active: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}
