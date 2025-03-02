import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, DollarSign, Users, Check } from 'lucide-react-native';
import axios from 'axios';

// Define the shape of a plan
interface Plan {
  _id: string;
  name: string;
  price: number;
  description: string;
  duration: number;
  maxDogs: number;
  image?: string;
}

// Define the shape of a booking
interface Booking {
  _id: string;
  user: string;
  plan: Plan;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const API_URL = 'http://localhost:3000/api';

export default function BookingScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Available time slots
  const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', 
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  // Available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Fetch plans from the API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/plans`);
      setPlans(response.data);
      
      // Set the first plan as selected by default
      if (response.data.length > 0) {
        setSelectedPlan(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to book a visit');
      return;
    }

    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (!selectedTime) {
      setError('Please select a time');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await axios.post(`${API_URL}/bookings`, {
        plan: selectedPlan._id,
        date: selectedDate,
        time: selectedTime,
        specialRequests: specialRequests.trim() || undefined,
      });
      
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setSpecialRequests('');
      
      // Show success message
      Alert.alert(
        'Booking Successful',
        'Your booking has been confirmed. You can view it in your profile.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading indicator while fetching plans
  if (loading && plans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  // Show error message if there was an error fetching plans
  if (error && plans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlans}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Your Visit</Text>
        <Text style={styles.subtitle}>
          Choose a plan, date, and time to spend with our furry friends
        </Text>
      </View>

      {/* Plans Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Plan</Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansContainer}
        >
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={[
                styles.planCard,
                selectedPlan?._id === plan._id && styles.selectedPlanCard,
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <Image
                source={{
                  uri: plan.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
                }}
                style={styles.planImage}
              />
              
              <View style={styles.planInfo}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>${plan.price}</Text>
                </View>
                
                <Text style={styles.planDescription}>{plan.description}</Text>
                
                <View style={styles.planDetails}>
                  <View style={styles.planDetail}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.planDetailText}>{plan.duration} hour{plan.duration > 1 ? 's' : ''}</Text>
                  </View>
                  
                  <View style={styles.planDetail}>
                    <Users size={16} color="#666" />
                    <Text style={styles.planDetailText}>Up to {plan.maxDogs} dog{plan.maxDogs > 1 ? 's' : ''}</Text>
                  </View>
                </View>
                
                {selectedPlan?._id === plan._id && (
                  <View style={styles.selectedIndicator}>
                    <Check size={16} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Date</Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesContainer}
        >
          {availableDates.map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateCard,
                selectedDate === date && styles.selectedDateCard,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dateText,
                selectedDate === date && styles.selectedDateText,
              ]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a Time</Text>
        
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeCard,
                selectedTime === time && styles.selectedTimeCard,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[
                styles.timeText,
                selectedTime === time && styles.selectedTimeText,
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Special Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
        
        <TextInput
          style={styles.specialRequestsInput}
          placeholder="Any special requests or preferences?"
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Booking Summary */}
      {selectedPlan && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan:</Text>
            <Text style={styles.summaryValue}>{selectedPlan.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price:</Text>
            <Text style={styles.summaryValue}>${selectedPlan.price}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {selectedDate ? formatDate(selectedDate) : 'Not selected'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>
              {selectedTime || 'Not selected'}
            </Text>
          </View>
        </View>
      )}

      {/* Error Message */}
      {error ? <Text style={styles.bookingError}>{error}</Text> : null}

      {/* Book Now Button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBooking}
        disabled={submitting || !selectedPlan || !selectedDate || !selectedTime}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <DollarSign size={20} color="#fff" />
            <Text style={styles.bookButtonText}>Book Now</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  plansContainer: {
    paddingRight: 16,
  },
  planCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanCard: {
    borderColor: '#ff6b6b',
  },
  planImage: {
    width: '100%',
    height: 140,
  },
  planInfo: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datesContainer: {
    paddingRight: 16,
  },
  dateCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDateCard: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDateText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  timeCard: {
    width: '31%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    margin: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeCard: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTimeText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  specialRequestsInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingError: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 16,
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b6b',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});