import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      // Coordenadas de Vilhena, RO
      const vilhenaCenter = { lat: -12.7406, lng: -60.1456 };

      // Inicializar o mapa
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: vilhenaCenter,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Dados das escolas com coordenadas reais de Vilhena
      const schools = [
        {
          name: 'E.M. Centro',
          position: { lat: -12.7356, lng: -60.1406 },
          capacity: 300,
          occupied: 285,
          status: 'high',
          address: 'Av. Capitão Castro, 1250 - Centro'
        },
        {
          name: 'E.M. Vila Nova',
          position: { lat: -12.7456, lng: -60.1506 },
          capacity: 250,
          occupied: 230,
          status: 'medium',
          address: 'Rua das Palmeiras, 456 - Vila Nova'
        },
        {
          name: 'EMEI Jardim Eldorado',
          position: { lat: -12.7306, lng: -60.1356 },
          capacity: 180,
          occupied: 150,
          status: 'low',
          address: 'Rua dos Girassóis, 789 - Jardim Eldorado'
        },
        {
          name: 'E.M. Oliveira',
          position: { lat: -12.7506, lng: -60.1556 },
          capacity: 200,
          occupied: 175,
          status: 'medium',
          address: 'Rua das Acácias, 321 - Residencial Oliveira'
        },
        {
          name: 'E.M. Bodoquena',
          position: { lat: -12.7256, lng: -60.1606 },
          capacity: 220,
          occupied: 200,
          status: 'high',
          address: 'Rua Bodoquena, 567 - Centro'
        },
        {
          name: 'EMEI Pequeno Príncipe',
          position: { lat: -12.7606, lng: -60.1306 },
          capacity: 160,
          occupied: 140,
          status: 'medium',
          address: 'Rua do Parque, 890 - Parque Industrial'
        }
      ];

      // Adicionar marcadores das escolas
      schools.forEach(school => {
        const occupancyRate = (school.occupied / school.capacity) * 100;
        
        // Definir cor baseada na ocupação
        let color = '#10b981'; // Verde (baixa ocupação)
        if (occupancyRate > 90) color = '#ef4444'; // Vermelho (alta ocupação)
        else if (occupancyRate > 75) color = '#f59e0b'; // Amarelo (média ocupação)

        // Criar marcador customizado
        const marker = new window.google.maps.Marker({
          position: school.position,
          map: map,
          title: school.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8 + (school.capacity / 50), // Tamanho baseado na capacidade
            fillColor: color,
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // InfoWindow com informações da escola
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${school.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${school.address}</p>
              <div style="margin: 8px 0;">
                <div style="font-size: 14px; color: #374151;">
                  <strong>Capacidade:</strong> ${school.capacity} alunos
                </div>
                <div style="font-size: 14px; color: #374151;">
                  <strong>Ocupação:</strong> ${school.occupied} alunos
                </div>
                <div style="font-size: 14px; color: #374151;">
                  <strong>Taxa:</strong> ${Math.round(occupancyRate)}%
                </div>
                <div style="font-size: 14px; color: #374151;">
                  <strong>Vagas disponíveis:</strong> ${school.capacity - school.occupied}
                </div>
              </div>
              <div style="margin-top: 8px; padding: 4px 8px; background-color: ${color}20; border-radius: 4px; font-size: 12px; color: ${color}; font-weight: 500;">
                ${occupancyRate > 90 ? 'Alta Demanda' : occupancyRate > 75 ? 'Demanda Moderada' : 'Vagas Disponíveis'}
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      // Dados para o mapa de calor (densidade populacional infantil)
      const heatmapData = [
        // Centro - alta densidade
        new window.google.maps.LatLng(-12.7356, -60.1406),
        new window.google.maps.LatLng(-12.7366, -60.1416),
        new window.google.maps.LatLng(-12.7346, -60.1396),
        new window.google.maps.LatLng(-12.7376, -60.1426),
        new window.google.maps.LatLng(-12.7336, -60.1386),
        
        // Vila Nova - densidade moderada
        new window.google.maps.LatLng(-12.7456, -60.1506),
        new window.google.maps.LatLng(-12.7466, -60.1516),
        new window.google.maps.LatLng(-12.7446, -60.1496),
        
        // Jardim Eldorado - densidade moderada
        new window.google.maps.LatLng(-12.7306, -60.1356),
        new window.google.maps.LatLng(-12.7316, -60.1366),
        new window.google.maps.LatLng(-12.7296, -60.1346),
        
        // Residencial Oliveira - baixa densidade
        new window.google.maps.LatLng(-12.7506, -60.1556),
        new window.google.maps.LatLng(-12.7516, -60.1566),
        
        // Parque Industrial - densidade moderada
        new window.google.maps.LatLng(-12.7606, -60.1306),
        new window.google.maps.LatLng(-12.7616, -60.1316),
        new window.google.maps.LatLng(-12.7596, -60.1296),
        
        // Pontos adicionais para simular densidade populacional
        new window.google.maps.LatLng(-12.7400, -60.1450),
        new window.google.maps.LatLng(-12.7420, -60.1470),
        new window.google.maps.LatLng(-12.7380, -60.1430),
        new window.google.maps.LatLng(-12.7440, -60.1490),
        new window.google.maps.LatLng(-12.7360, -60.1410),
        new window.google.maps.LatLng(-12.7480, -60.1520),
        new window.google.maps.LatLng(-12.7320, -60.1370),
        new window.google.maps.LatLng(-12.7520, -60.1570)
      ];

      // Criar mapa de calor
      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: 50,
        opacity: 0.6,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });

      // Adicionar controles personalizados
      const toggleHeatmapButton = document.createElement('button');
      toggleHeatmapButton.textContent = 'Alternar Mapa de Calor';
      toggleHeatmapButton.style.cssText = `
        background: white;
        border: 2px solid #1e40af;
        border-radius: 6px;
        color: #1e40af;
        cursor: pointer;
        font-family: system-ui;
        font-size: 14px;
        font-weight: 500;
        margin: 10px;
        padding: 8px 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s;
      `;
      
      toggleHeatmapButton.addEventListener('mouseover', () => {
        toggleHeatmapButton.style.backgroundColor = '#1e40af';
        toggleHeatmapButton.style.color = 'white';
      });
      
      toggleHeatmapButton.addEventListener('mouseout', () => {
        toggleHeatmapButton.style.backgroundColor = 'white';
        toggleHeatmapButton.style.color = '#1e40af';
      });

      let heatmapVisible = true;
      toggleHeatmapButton.addEventListener('click', () => {
        heatmapVisible = !heatmapVisible;
        heatmap.setMap(heatmapVisible ? map : null);
        toggleHeatmapButton.textContent = heatmapVisible ? 'Ocultar Mapa de Calor' : 'Mostrar Mapa de Calor';
      });

      map.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(toggleHeatmapButton);

      // Adicionar legenda
      const legend = document.createElement('div');
      legend.style.cssText = `
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-family: system-ui;
        margin: 10px;
        padding: 16px;
        min-width: 200px;
      `;
      
      legend.innerHTML = `
        <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1f2937;">Legenda</h4>
        <div style="margin-bottom: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 16px; height: 16px; background-color: #10b981; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #10b981;"></div>
            <span style="font-size: 14px; color: #374151;">Vagas Disponíveis (&lt;75%)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 16px; height: 16px; background-color: #f59e0b; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #f59e0b;"></div>
            <span style="font-size: 14px; color: #374151;">Demanda Moderada (75-90%)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="width: 16px; height: 16px; background-color: #ef4444; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #ef4444;"></div>
            <span style="font-size: 14px; color: #374151;">Alta Demanda (&gt;90%)</span>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <div style="font-size: 14px; font-weight: 500; color: #1f2937; margin-bottom: 6px;">Mapa de Calor:</div>
            <div style="font-size: 13px; color: #6b7280;">Densidade populacional infantil por região</div>
            <div style="display: flex; align-items: center; margin-top: 6px;">
              <div style="width: 20px; height: 4px; background: linear-gradient(to right, rgba(0,255,255,0.6), rgba(255,0,0,0.8)); margin-right: 8px; border-radius: 2px;"></div>
              <span style="font-size: 12px; color: #6b7280;">Baixa → Alta</span>
            </div>
          </div>
        </div>
      `;

      map.controls[window.google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
    };

    // Verificar se a API do Google Maps já foi carregada
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Aguardar o carregamento da API
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      // Timeout de segurança
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!window.google || !window.google.maps) {
          console.error('Google Maps API não foi carregada');
          if (mapRef.current) {
            mapRef.current.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f3f4f6; border-radius: 8px; color: #6b7280; font-family: system-ui;">
                <div style="text-align: center;">
                  <div style="font-size: 18px; margin-bottom: 8px;">⚠️</div>
                  <div>Erro ao carregar o mapa</div>
                  <div style="font-size: 14px; margin-top: 4px;">Verifique a conexão com a internet</div>
                </div>
              </div>
            `;
          }
        }
      }, 10000);
    }

    return () => {
      if (mapInstanceRef.current) {
        // Cleanup se necessário
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg border border-gray-200"
      style={{ minHeight: '400px' }}
    />
  );
};

export default MapComponent;