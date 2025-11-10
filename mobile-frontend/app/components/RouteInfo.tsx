import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Route } from '../api/routes';

// Helper to find fastest route index
function getFastestIndex(routes: Route[]) {
  let min = Infinity;
  let idx = 0;
  routes.forEach((route, i) => {
    if (route.duration < min) {
      min = route.duration;
      idx = i;
    }
  });
  return idx;
}

interface RouteInfoProps {
  routes: Route[];
}

const RouteInfo: React.FC<RouteInfoProps> = ({ routes }) => {
  if (!routes || routes.length === 0) {
    return null;
  }

  const fastestIdx = getFastestIndex(routes);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Routes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {routes.map((route, index) => (
          <View 
            key={index} 
            style={[
              styles.routeCard, 
              index === fastestIdx && styles.fastestCard
            ]}
          >
            <Text style={[
              styles.routeNumber,
              index === fastestIdx && styles.fastestText
            ]}>
              {index === fastestIdx ? '🚀 Fastest' : '🛣️ Alternative'} — Route {index + 1}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Distance:</Text>
              <Text style={styles.value}>
                {(route.distance / 1000).toFixed(2)} km
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>
                {Math.round(route.duration / 60)} min
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Avg Speed:</Text>
              <Text style={styles.value}>
                {((route.distance / 1000) / (route.duration / 3600)).toFixed(0)} km/h
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 85, // Increased so it's above nav bar & visible
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.26,
    shadowRadius: 6,
    elevation: 7,
    maxHeight: 210,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#333',
    alignSelf: 'center'
  },
  routeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 16,
    marginRight: 14,
    minWidth: 210,
    borderWidth: 2,
    borderColor: '#007bff',
    elevation: 3,
  },
  fastestCard: {
    borderColor: '#26c900',
    backgroundColor: '#eaffea',
    elevation: 10,
  },
  routeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
    textAlign: 'center'
  },
  fastestText: {
    color: '#26c900',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500'
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});

export default RouteInfo;
