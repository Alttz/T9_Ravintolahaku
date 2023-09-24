import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [searchLocation, onChangeLocation] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 60.200692,
    longitude: 24.934302,
    latitudeDelta: 0.0322,
    longitudeDelta: 0.0221,
  });
  const [markers, setMarkers] = useState([]);

  const findLocation = () => {
    const apikey = process.env.EXPO_PUBLIC_API_KEY;

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocation)}&key=${apikey}`;

    fetch(geocodeUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results[0] && data.results[0].geometry && data.results[0].geometry.location) {
          const lat = data.results[0].geometry.location.lat;
          const lng = data.results[0].geometry.location.lng;

          setMapRegion({
            ...mapRegion,
            latitude: lat,
            longitude: lng,
          });

          const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=restaurant&key=${apikey}`;
          return fetch(nearbySearchUrl);
        }
      })
      .then(response => response.json())
      .then(result => {
        if (result && result.results) {
          const newMarkers = result.results.map(restaurant => ({
            latlng: {
              latitude: restaurant.geometry.location.lat,
              longitude: restaurant.geometry.location.lng,
            },
            title: restaurant.name,
            description: restaurant.vicinity,
          }));
          setMarkers(newMarkers);
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  };

  return (
    <View style={styles.container}>

      <MapView
        style={{ flex: 1, width: "100%", height: "100%" }}
        region={mapRegion}
        onRegionChangeComplete={newRegion => setMapRegion(newRegion)}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.latlng}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>

      <TextInput
        style={styles.input}
        onChangeText={onChangeLocation}
        value={searchLocation}
        placeholder="Enter location here..."
      />
      <TouchableOpacity style={styles.button} onPress={findLocation}>
        <Text style={styles.buttonText}>Show</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    width: "90%",
    alignItems: 'center',
    backgroundColor: '#0066ff',
    padding: 10,
  },
  input: {
    width: "90%",
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});
