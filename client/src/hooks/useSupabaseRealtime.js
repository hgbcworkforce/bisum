import { useState, useEffect, useRef } from 'react';
import { subscribeToAttendees } from '../lib/attendees.js';
import { subscribeToPayments } from '../lib/payments.js';

// Custom hook for real-time attendee updates
export const useAttendeesRealtime = (callback) => {
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Subscribe to attendees changes
    subscriptionRef.current = subscribeToAttendees((payload) => {
      setIsConnected(true);

      if (callback) {
        callback(payload);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [callback]);

  return { isConnected };
};

// Custom hook for real-time payment updates
export const usePaymentsRealtime = (callback) => {
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Subscribe to payments changes
    subscriptionRef.current = subscribeToPayments((payload) => {
      setIsConnected(true);

      if (callback) {
        callback(payload);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [callback]);

  return { isConnected };
};

// Custom hook for dashboard real-time updates
export const useDashboardRealtime = (onStatsUpdate) => {
  const [stats, setStats] = useState({
    totalAttendees: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    recentRegistrations: []
  });

  const [isConnected, setIsConnected] = useState(false);
  const attendeeSubscriptionRef = useRef(null);
  const paymentSubscriptionRef = useRef(null);

  useEffect(() => {
    // Subscribe to attendee changes
    attendeeSubscriptionRef.current = subscribeToAttendees((payload) => {
      setIsConnected(true);

      const { eventType, new: newRecord, old: oldRecord } = payload;

      setStats(prevStats => {
        let newStats = { ...prevStats };

        switch (eventType) {
          case 'INSERT':
            newStats.totalAttendees += 1;
            if (newRecord.payment_status === 'pending') {
              newStats.pendingPayments += 1;
            } else if (newRecord.payment_status === 'completed') {
              newStats.completedPayments += 1;
            }

            // Add to recent registrations (keep only last 5)
            const newAttendee = {
              id: newRecord.id,
              fullName: `${newRecord.first_name} ${newRecord.last_name}`,
              email: newRecord.email,
              registrationDate: newRecord.created_at,
              paymentStatus: newRecord.payment_status,
              registrationType: newRecord.registration_type
            };

            newStats.recentRegistrations = [
              newAttendee,
              ...prevStats.recentRegistrations.slice(0, 4)
            ];
            break;

          case 'UPDATE':
            // Handle payment status changes
            if (oldRecord.payment_status !== newRecord.payment_status) {
              if (oldRecord.payment_status === 'pending' && newRecord.payment_status === 'completed') {
                newStats.pendingPayments -= 1;
                newStats.completedPayments += 1;
              } else if (oldRecord.payment_status === 'completed' && newRecord.payment_status === 'pending') {
                newStats.pendingPayments += 1;
                newStats.completedPayments -= 1;
              } else if (oldRecord.payment_status === 'pending' && newRecord.payment_status === 'failed') {
                newStats.pendingPayments -= 1;
              }
            }
            break;

          case 'DELETE':
            newStats.totalAttendees -= 1;
            if (oldRecord.payment_status === 'pending') {
              newStats.pendingPayments -= 1;
            } else if (oldRecord.payment_status === 'completed') {
              newStats.completedPayments -= 1;
            }

            // Remove from recent registrations
            newStats.recentRegistrations = prevStats.recentRegistrations.filter(
              reg => reg.id !== oldRecord.id
            );
            break;
        }

        if (onStatsUpdate) {
          onStatsUpdate(newStats);
        }

        return newStats;
      });
    });

    // Subscribe to payment changes
    paymentSubscriptionRef.current = subscribeToPayments((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setStats(prevStats => {
        let newStats = { ...prevStats };

        switch (eventType) {
          case 'INSERT':
            // New payment created (usually pending)
            break;

          case 'UPDATE':
            // Payment status changed
            if (oldRecord.status !== newRecord.status) {
              if (newRecord.status === 'completed') {
                // Add to total revenue
                newStats.totalRevenue += newRecord.amount || 0;
              } else if (oldRecord.status === 'completed' && newRecord.status !== 'completed') {
                // Subtract from total revenue (refund/cancellation)
                newStats.totalRevenue -= oldRecord.amount || 0;
              }
            }
            break;
        }

        if (onStatsUpdate) {
          onStatsUpdate(newStats);
        }

        return newStats;
      });
    });

    // Cleanup subscriptions on unmount
    return () => {
      if (attendeeSubscriptionRef.current) {
        attendeeSubscriptionRef.current.unsubscribe();
      }
      if (paymentSubscriptionRef.current) {
        paymentSubscriptionRef.current.unsubscribe();
      }
    };
  }, [onStatsUpdate]);

  return { stats, isConnected };
};

// Custom hook for managing registration form with real-time validation
export const useRegistrationForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    organization: '',
    position: '',
    registrationType: 'professional',
    dietaryRestrictions: '',
    specialNeeds: '',
    sessionPreferences: [],
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Email validation with debounce
  const emailCheckTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'sessionPreferences') {
        const session = value;
        setFormData(prev => ({
          ...prev,
          sessionPreferences: checked
            ? [...prev.sessionPreferences, session]
            : prev.sessionPreferences.filter(s => s !== session)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Real-time email validation
      if (name === 'email' && value) {
        // Clear existing timeout
        if (emailCheckTimeoutRef.current) {
          clearTimeout(emailCheckTimeoutRef.current);
        }

        // Set new timeout for email check
        emailCheckTimeoutRef.current = setTimeout(async () => {
          try {
            const { checkEmailExists } = await import('../lib/attendees.js');
            const result = await checkEmailExists(value);
            setEmailExists(result.exists);

            if (result.exists) {
              setErrors(prev => ({
                ...prev,
                email: 'This email is already registered'
              }));
            } else {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.email;
                return newErrors;
              });
            }
          } catch (error) {
            console.warn('Email check failed:', error);
          }
        }, 500); // 500ms debounce
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'organization',
      'registrationType'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || typeof formData[field] !== 'string' || !formData[field].trim()) {
        newErrors[field] = `${field} is required`;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phoneNumber && !/^[\d\s\+\-()]{10,}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Check if email already exists
    if (emailExists) {
      newErrors.email = 'This email is already registered';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      organization: '',
      position: '',
      registrationType: 'professional',
      dietaryRestrictions: '',
      specialNeeds: '',
      sessionPreferences: [],
      ...initialData
    });
    setErrors({});
    setEmailExists(false);
    setIsSubmitting(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    emailExists,
    handleInputChange,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
    setIsSubmitting
  };
};

// Custom hook for data fetching with loading states
export const useSupabaseQuery = (queryFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await queryFunction();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Query failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Export all hooks
export default {
  useAttendeesRealtime,
  usePaymentsRealtime,
  useDashboardRealtime,
  useRegistrationForm,
  useSupabaseQuery
};
