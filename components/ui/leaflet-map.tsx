import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  badge?: string;
};

export type LeafletMapHandle = {
  focusOn: (lat: number, lng: number, zoom?: number) => void;
};

type Props = {
  initialLat: number;
  initialLng: number;
  initialZoom?: number;
  markers?: MapMarker[];
  onMarkerPress?: (id: string) => void;
  style?: any;
};

const LeafletMap = forwardRef<LeafletMapHandle, Props>(
  ({ initialLat, initialLng, initialZoom = 13, markers = [], onMarkerPress, style }, ref) => {
    const webViewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      focusOn: (lat, lng, zoom = 15) => {
        webViewRef.current?.injectJavaScript(
          `map.setView([${lat}, ${lng}], ${zoom}); true;`
        );
      },
    }));

    const markersJson = JSON.stringify(
      markers.map((m) => ({
        id: m.id,
        lat: m.lat,
        lng: m.lng,
        title: m.title,
        subtitle: m.subtitle ?? "",
        badge: m.badge ?? "",
      }))
    );

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body,html,#map{margin:0;padding:0;height:100%;width:100%;}
    .popup-title{font-weight:700;font-size:14px;margin-bottom:3px;}
    .popup-sub{color:#555;font-size:12px;margin-bottom:6px;}
    .popup-badge{background:#d7efe6;color:#164A40;padding:2px 8px;border-radius:6px;font-size:12px;font-weight:600;display:inline-block;}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{zoomControl:true}).setView([${initialLat},${initialLng}],${initialZoom});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'\\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom:19
  }).addTo(map);

  var data = ${markersJson};
  data.forEach(function(m){
    var icon = L.divIcon({
      className:'',
      html:'<div style="background:#164A40;width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.35);"></div>',
      iconSize:[16,16],
      iconAnchor:[8,8],
      popupAnchor:[0,-10]
    });
    var mk = L.marker([m.lat,m.lng],{icon:icon}).addTo(map);
    mk.bindPopup(
      '<div class="popup-title">'+m.title+'</div>'+
      (m.subtitle?'<div class="popup-sub">'+m.subtitle+'</div>':'')+
      (m.badge?'<div class="popup-badge">'+m.badge+'</div>':'')
    );
    mk.on('click',function(){
      if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'markerClick',id:m.id}));
      }
    });
  });

  map.locate({watch:false,setView:false,maxZoom:14});
  map.on('locationfound',function(e){
    L.circleMarker(e.latlng,{
      radius:8,color:'#fff',weight:2,
      fillColor:'#4285F4',fillOpacity:1
    }).addTo(map).bindPopup('Your location');
  });
</script>
</body>
</html>`;

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={styles.webview}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
          allowFileAccess
          onMessage={(e) => {
            try {
              const msg = JSON.parse(e.nativeEvent.data);
              if (msg.type === "markerClick" && onMarkerPress) {
                onMarkerPress(msg.id);
              }
            } catch {}
          }}
        />
      </View>
    );
  }
);

export default LeafletMap;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  webview: { flex: 1, backgroundColor: "transparent" },
});
