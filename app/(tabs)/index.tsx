import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();

  const featuredDogs = [
    {
      id: '1',
      name: 'Bella',
      breed: 'Golden Retriever',
      age: '2 years',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '2',
      name: 'Max',
      breed: 'Corgi',
      age: '1 year',
      image: 'https://images.unsplash.com/photo-1554692918-08fa0fdc9db3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '3',
      name: 'Luna',
      breed: 'Husky',
      age: '3 years',
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Welcome to Dog Cafe 6ix</Text>
          <Text style={styles.heroSubtitle}>
            {user ? `Welcome back, ${user.username || 'friend'}!` : 'A place for dogs and humans to connect'}
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <Text style={styles.heroButtonText}>Book Now</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCardsContainer}>
        <View style={styles.infoCard}>
          <Clock size={24} color="#ff6b6b" />
          <Text style={styles.infoCardTitle}>Opening Hours</Text>
          <Text style={styles.infoCardText}>Mon-Fri: 10am-8pm</Text>
          <Text style={styles.infoCardText}>Sat-Sun: 9am-9pm</Text>
        </View>
        
        <View style={styles.infoCard}>
          <MapPin size={24} color="#ff6b6b" />
          <Text style={styles.infoCardTitle}>Location</Text>
          <Text style={styles.infoCardText}>123 Bark Street</Text>
          <Text style={styles.infoCardText}>Toronto, ON</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Star size={24} color="#ff6b6b" />
          <Text style={styles.infoCardTitle}>Rating</Text>
          <Text style={styles.infoCardText}>4.9/5 Stars</Text>
          <Text style={styles.infoCardText}>500+ Reviews</Text>
        </View>
      </View>

      {/* Featured Dogs Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Dogs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredDogsContainer}
        >
          {featuredDogs.map((dog) => (
            <TouchableOpacity key={dog.id} style={styles.dogCard}>
              <Image source={{ uri: dog.image }} style={styles.dogImage} />
              <View style={styles.dogInfo}>
                <Text style={styles.dogName}>{dog.name}</Text>
                <Text style={styles.dogBreed}>{dog.breed}</Text>
                <Text style={styles.dogAge}>{dog.age}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Plans Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Plans</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/booking')}>
            <Text style={styles.seeAllText}>Book Now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Plan A</Text>
              <Text style={styles.planPrice}>$50</Text>
            </View>
            <Text style={styles.planDescription}>
              1-hour visit with any dog of your choice, includes a beverage
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Plan B</Text>
              <Text style={styles.planPrice}>$70</Text>
            </View>
            <Text style={styles.planDescription}>
              2-hour visit with any 2 dogs, includes a beverage and snack
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => router.push('/(tabs)/booking')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Plan C</Text>
              <Text style={styles.planPrice}>$100</Text>
            </View>
            <Text style={styles.planDescription}>
              3-hour visit with any 3 dogs, includes full meal and priority booking
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Testimonials */}
      <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>What Our Customers Say</Text>
        
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            "The best experience ever! The dogs were so friendly and the staff was amazing. Will definitely come back!"
          </Text>
          <View style={styles.testimonialAuthor}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }}
              style={styles.testimonialAvatar}
            />
            <View>
              <Text style={styles.testimonialName}>Sarah Johnson</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} color="#FFD700" fill="#FFD700" />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroContainer: {
    position: 'relative',
    height: 300,
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b6b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  featuredDogsContainer: {
    paddingRight: 16,
  },
  dogCard: {
    width: 160,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  dogImage: {
    width: '100%',
    height: 120,
  },
  dogInfo: {
    padding: 12,
  },
  dogName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dogBreed: {
    fontSize: 14,
    color: '#666',
  },
  dogAge: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  plansContainer: {
    marginBottom: 8,
  },
  planCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testimonialCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  testimonialText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 16,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
});