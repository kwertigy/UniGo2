import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../_constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TomTomMapProps {
  mode?: 'rider' | 'driver';
  showPickupPoints?: boolean;
  showRoute?: boolean;
  showTraffic?: boolean;
  pickupPoints?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
  }>;
  userLocation?: {
    lat: number;
    lng: number;
  };
  destination?: {
    lat: number;
    lng: number;
    name?: string;
  };
  routeStart?: {
    lat: number;
    lng: number;
    name?: string;
  };
  routeEnd?: {
    lat: number;
    lng: number;
    name?: string;
  };
  onPickupSelect?: (pointId: string) => void;
  height?: number;
}

// TomTom API Key
const TOMTOM_API_KEY = 'CHKrCosQhhodrT8UO4bFl0M3v3e8GDJL';

// Koramangala coordinates
const KORAMANGALA = {
  lat: 12.9352,
  lng: 77.6245,
};

// New Horizon College of Engineering Marathahalli coordinates
const NHCE_MARATHAHALLI = {
  lat: 12.9591,
  lng: 77.6974,
};

// Default center (between Koramangala and NHCE)
const DEFAULT_CENTER = {
  lat: 12.9471,
  lng: 77.6609,
};

export const TomTomMap: React.FC<TomTomMapProps> = ({
  mode = 'rider',
  showPickupPoints = true,
  showRoute = true,
  showTraffic = true,
  pickupPoints = [],
  userLocation,
  destination,
  routeStart = KORAMANGALA,
  routeEnd = NHCE_MARATHAHALLI,
  onPickupSelect,
  height = 240,
}) => {
  const center = userLocation || DEFAULT_CENTER;

  const mapHtml = useMemo(() => {
    const pickupMarkersJs = pickupPoints
      .map(
        (point) => `
        var marker${point.id} = new tt.Marker({
          element: createCustomMarker('${point.name}', 'pickup')
        })
          .setLngLat([${point.lng}, ${point.lat}])
          .addTo(map);
        
        marker${point.id}.getElement().addEventListener('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'pickup_selected',
            pointId: '${point.id}',
            name: '${point.name}'
          }));
        });
      `
      )
      .join('\n');

    const destinationMarkerJs = destination
      ? `
        var destMarker = new tt.Marker({
          element: createCustomMarker('${destination.name || 'Destination'}', 'destination')
        })
          .setLngLat([${destination.lng}, ${destination.lat}])
          .addTo(map);
      `
      : '';

    const userMarkerJs = userLocation
      ? `
        var userMarker = new tt.Marker({
          element: createCustomMarker('You', 'user')
        })
          .setLngLat([${userLocation.lng}, ${userLocation.lat}])
          .addTo(map);
      `
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" type="text/css" href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css">
        <script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js"></script>
        <script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/services/services-web.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; }
          #map { width: 100%; height: 100%; }
          
          .custom-marker {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          }
          
          .marker-dot {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          
          .marker-dot.pickup {
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%);
          }
          
          .marker-dot.destination {
            background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
          }
          
          .marker-dot.user {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            animation: pulse 2s infinite;
          }
          
          .marker-dot.start {
            background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          }
          
          .marker-dot.end {
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          }
          
          .marker-label {
            margin-top: 4px;
            padding: 2px 6px;
            background: rgba(0,0,0,0.75);
            border-radius: 4px;
            font-size: 10px;
            color: white;
            white-space: nowrap;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .legend {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 10px;
            color: white;
            z-index: 1000;
          }
          
          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 4px 0;
          }
          
          .legend-line {
            width: 20px;
            height: 4px;
            border-radius: 2px;
          }
          
          .legend-line.route { background: #3B82F6; }
          .legend-line.traffic { background: #EF4444; }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-line route"></div>
            <span>Route</span>
          </div>
          <div class="legend-item">
            <div class="legend-line traffic"></div>
            <span>Heavy Traffic</span>
          </div>
        </div>
        <script>
          function createCustomMarker(label, type) {
            var el = document.createElement('div');
            el.className = 'custom-marker';
            var icon = type === 'user' ? '📍' : type === 'destination' ? '🎯' : type === 'start' ? '🟢' : type === 'end' ? '🔴' : '🚗';
            el.innerHTML = '<div class="marker-dot ' + type + '">' + icon + '</div><div class="marker-label">' + label + '</div>';
            return el;
          }
          
          var map = tt.map({
            key: '${TOMTOM_API_KEY}',
            container: 'map',
            center: [${center.lng}, ${center.lat}],
            zoom: 12,
            style: 'https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_night&poi=poi_main'
          });
          
          map.addControl(new tt.NavigationControl());
          
          // Route coordinates: Koramangala to NHCE Marathahalli
          var routeStart = [${routeStart.lng}, ${routeStart.lat}];
          var routeEnd = [${routeEnd.lng}, ${routeEnd.lat}];
          
          // Simulated route points (Koramangala -> Domlur -> HAL -> Marathahalli -> NHCE)
          var routeCoordinates = [
            [77.6245, 12.9352], // Koramangala
            [77.6350, 12.9450], // Domlur
            [77.6550, 12.9580], // HAL
            [77.6750, 12.9560], // Marathahalli
            [77.6974, 12.9591]  // NHCE
          ];
          
          // Traffic congestion points (simulated heavy traffic areas)
          var trafficPoints = [
            // Silk Board area - heavy traffic
            [[77.6280, 12.9170], [77.6320, 12.9250], [77.6350, 12.9350]],
            // Marathahalli ORR - moderate traffic
            [[77.6700, 12.9540], [77.6750, 12.9560], [77.6850, 12.9570]],
            // Domlur signal - traffic
            [[77.6320, 12.9420], [77.6380, 12.9480]]
          ];
          
          map.on('load', function() {
            // Add main route line (blue)
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates
                }
              }
            });
            
            map.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3B82F6',
                'line-width': 5,
                'line-opacity': 0.9
              }
            });
            
            // Add route glow effect
            map.addLayer({
              id: 'route-glow',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#60A5FA',
                'line-width': 10,
                'line-opacity': 0.3
              }
            }, 'route-line');
            
            // Add traffic overlay lines (red)
            trafficPoints.forEach(function(segment, index) {
              map.addSource('traffic-' + index, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: segment
                  }
                }
              });
              
              map.addLayer({
                id: 'traffic-line-' + index,
                type: 'line',
                source: 'traffic-' + index,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#EF4444',
                  'line-width': 6,
                  'line-opacity': 0.8
                }
              });
              
              // Traffic glow
              map.addLayer({
                id: 'traffic-glow-' + index,
                type: 'line',
                source: 'traffic-' + index,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#F87171',
                  'line-width': 12,
                  'line-opacity': 0.3
                }
              }, 'traffic-line-' + index);
            });
            
            // Add start marker (Koramangala)
            var startMarker = new tt.Marker({
              element: createCustomMarker('Koramangala', 'start')
            })
              .setLngLat(routeStart)
              .addTo(map);
            
            // Add end marker (NHCE)
            var endMarker = new tt.Marker({
              element: createCustomMarker('NHCE Marathahalli', 'end')
            })
              .setLngLat(routeEnd)
              .addTo(map);
            
            ${userMarkerJs}
            ${destinationMarkerJs}
            ${pickupMarkersJs}
            
            // Fit map to show the entire route
            var bounds = new tt.LngLatBounds();
            routeCoordinates.forEach(function(coord) {
              bounds.extend(coord);
            });
            map.fitBounds(bounds, { padding: 40 });
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'map_loaded'
            }));
          });
          
          map.on('error', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'map_error',
              error: e.message || 'Map loading failed'
            }));
          });
        </script>
      </body>
      </html>
    `;
  }, [center, pickupPoints, userLocation, destination, routeStart, routeEnd]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'pickup_selected' && onPickupSelect) {
        onPickupSelect(data.pointId);
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  // For web platform, show a placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webPlaceholder, { height }]}>
        <Ionicons name="map" size={48} color={COLORS.electricBlue} />
        <Text style={styles.placeholderText}>TomTom Map</Text>
        <Text style={styles.placeholderSubtext}>Available on mobile app</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        style={styles.webview}
        source={{ html: mapHtml }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scrollEnabled={false}
        bounces={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Ionicons name="map" size={32} color={COLORS.orange} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />
      
      {/* Mode indicator overlay */}
      <View style={styles.modeIndicator}>
        <Ionicons 
          name={mode === 'driver' ? 'car' : 'person'} 
          size={14} 
          color={COLORS.white} 
        />
        <Text style={styles.modeText}>
          {mode === 'driver' ? 'Driver View' : 'Rider View'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.slate900,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.slate900,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.whiteAlpha60,
    fontSize: FONTS.sizes.sm,
  },
  modeIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  modeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  webPlaceholder: {
    width: '100%',
    backgroundColor: COLORS.slate900,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  placeholderText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  placeholderSubtext: {
    color: COLORS.whiteAlpha60,
    fontSize: FONTS.sizes.sm,
  },
});
