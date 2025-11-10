import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { getRoutes, Route } from '../api/routes';
import RouteInfo from '../components/RouteInfo';

export default function HomeScreen() {
  const [startLat, setStartLat] = useState('28.7041');
  const [startLng, setStartLng] = useState('77.1025');
  const [endLat, setEndLat] = useState('28.5355');
  const [endLng, setEndLng] = useState('77.3910');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeCoordinatesList, setRouteCoordinatesList] = useState<any[][]>([]);
  const [fastestIdx, setFastestIdx] = useState(0);
  const [showInputPanel, setShowInputPanel] = useState(true);
  const [showRoutePanel, setShowRoutePanel] = useState(true);

  const mapRef = useRef<MapView>(null);

  const getFastestIndex = (routes: Route[]) => {
    let min = Infinity, idx = 0;
    routes.forEach((r, i) => {
      if (r.duration < min) {
        min = r.duration; idx = i;
      }
    });
    return idx;
  };

  const handleSubmit = async () => {
    const start_lat = parseFloat(startLat);
    const start_lng = parseFloat(startLng);
    const end_lat = parseFloat(endLat);
    const end_lng = parseFloat(endLng);

    if (isNaN(start_lat) || isNaN(start_lng) || isNaN(end_lat) || isNaN(end_lng)) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return;
    }

    setLoading(true);
    try {
      const result = await getRoutes(start_lat, start_lng, end_lat, end_lng);
      setRoutes(result);

      const coordsList = result.map(route => {
        if (route.geometry) {
          const decoded = polyline.decode(route.geometry);
          return decoded.map(([lat, lng]) => ({
            latitude: lat,
            longitude: lng,
          }));
        }
        return [];
      });
      setRouteCoordinatesList(coordsList);

      const idx = getFastestIndex(result);
      setFastestIdx(idx);

      if (mapRef.current && coordsList[idx] && coordsList[idx].length > 0) {
        mapRef.current.fitToCoordinates(coordsList[idx], {
          edgePadding: { top: 60, right: 60, bottom: 260, left: 60 },
          animated: true,
        });
      }
      setShowInputPanel(false);
      setShowRoutePanel(true); // show route cards automatically
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error fetching routes', err.message);
      } else {
        Alert.alert('Error fetching routes', 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {/* Start Marker */}
        {startLat && startLng && (
          <Marker
            coordinate={{
              latitude: parseFloat(startLat),
              longitude: parseFloat(startLng),
            }}
            title="Start"
            pinColor="green"
          />
        )}

        {/* End Marker */}
        {endLat && endLng && (
          <Marker
            coordinate={{
              latitude: parseFloat(endLat),
              longitude: parseFloat(endLng),
            }}
            title="Destination"
            pinColor="red"
          />
        )}

        {/* All Route Polylines */}
        {routeCoordinatesList.map((coords, idx) => (
          <Polyline
            key={idx}
            coordinates={coords}
            strokeColor={idx === fastestIdx ? "#26c900" : "#007bff"}
            strokeWidth={idx === fastestIdx ? 6 : 3}
            zIndex={idx === fastestIdx ? 10 : 1}
          />
        ))}
      </MapView>

      {/* Input Panel — collapsible! */}
      {showInputPanel && (
        <View style={styles.inputPanel}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowInputPanel(false)}
          >
            <Text style={{fontSize:20}}>✖</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Dynamic Route Planner</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Start Location</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                value={startLat}
                onChangeText={setStartLat}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                value={startLng}
                onChangeText={setStartLng}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                value={endLat}
                onChangeText={setEndLat}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                value={endLng}
                onChangeText={setEndLng}
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Find Routes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      {/* Floating button to bring back input panel if hidden */}
      {!showInputPanel && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowInputPanel(true)}>
          <Text style={{fontSize:22, color:'#fff'}}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Route Info Display, collapsible + floating button */}
      {routes.length > 0 && showRoutePanel && (
        <View style={styles.routePanelOverlay}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowRoutePanel(false)}
          >
            <Text style={{fontSize:20}}>✖</Text>
          </TouchableOpacity>
          <RouteInfo routes={routes} />
        </View>
      )}
      {routes.length > 0 && !showRoutePanel && (
        <TouchableOpacity style={styles.fabBottom} onPress={() => setShowRoutePanel(true)}>
          <Text style={{fontSize:22, color:'#fff'}}>🛣️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  inputPanel: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
  routePanelOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 75, // Lower - more map visible!
    zIndex: 20,
  },
  fab: {
    position: 'absolute',
    top: 32,
    right: 20,
    width: 48,
    height: 48,
    backgroundColor: '#007bff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 15,
  },
  fabBottom: {
    position: 'absolute',
    left: 20,
    bottom: 85,
    width: 48,
    height: 48,
    backgroundColor: '#26c900',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 15,
  },
  closeBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 4,
    zIndex: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    alignSelf: 'center'
  },
  inputGroup: { marginBottom: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
