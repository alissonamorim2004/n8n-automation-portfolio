import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

interface ProximityMapProps {
  userDistrict?: string;
  className?: string;
}

const ProximityMap: React.FC<ProximityMapProps> = ({ userDistrict, className = "w-full h-64" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [legendVisible, setLegendVisible] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      // Coordenadas de Vilhena, RO
      const vilhenaCenter = { lat: -12.7406, lng: -60.1456 };

      // Coordenadas dos bairros
      const districtCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'Centro': { lat: -12.7356, lng: -60.1406 },
        'Vila Nova': { lat: -12.7456, lng: -60.1506 },
        'Jardim Eldorado': { lat: -12.7306, lng: -60.1356 },
        'Residencial Oliveira': { lat: -12.7506, lng: -60.1556 },
        'Parque Industrial': { lat: -12.7606, lng: -60.1306 },
        'Jardim América': { lat: -12.7256, lng: -60.1606 },
        'Bodoquena': { lat: -12.7406, lng: -60.1656 },
        'Cristo Rei': { lat: -12.7156, lng: -60.1456 }
      };

      // Determinar centro do mapa baseado no bairro do usuário
      const userDistrictName = (user?.profile as any)?.district || userDistrict;
      const mapCenter = userDistrictName && districtCoordinates[userDistrictName] 
        ? districtCoordinates[userDistrictName] 
        : vilhenaCenter;

      // Inicializar o mapa
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 14,
        center: mapCenter,
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

      // Dados das escolas com informações de proximidade
      const schools = [
        {
          name: 'E.M. Centro',
          position: { lat: -12.7356, lng: -60.1406 },
          capacity: 300,
          occupied: 285,
          waitingList: 45,
          district: 'Centro',
          levels: ['Fundamental I', 'Fundamental II'],
          address: 'Av. Capitão Castro, 1250 - Centro',
          phone: '(69) 3321-1234'
        },
        {
          name: 'E.M. Vila Nova',
          position: { lat: -12.7456, lng: -60.1506 },
          capacity: 250,
          occupied: 230,
          waitingList: 32,
          district: 'Vila Nova',
          levels: ['Fundamental I', 'Fundamental II', 'Ensino Médio'],
          address: 'Rua das Palmeiras, 456 - Vila Nova',
          phone: '(69) 3321-8765'
        },
        {
          name: 'EMEI Jardim Eldorado',
          position: { lat: -12.7306, lng: -60.1356 },
          capacity: 180,
          occupied: 150,
          waitingList: 28,
          district: 'Jardim Eldorado',
          levels: ['Educação Infantil'],
          address: 'Rua dos Girassóis, 789 - Jardim Eldorado',
          phone: '(69) 3321-5678'
        },
        {
          name: 'E.M. Oliveira',
          position: { lat: -12.7506, lng: -60.1556 },
          capacity: 200,
          occupied: 175,
          waitingList: 15,
          district: 'Residencial Oliveira',
          levels: ['Fundamental I', 'Fundamental II'],
          address: 'Rua das Acácias, 321 - Residencial Oliveira',
          phone: '(69) 3321-9876'
        },
        {
          name: 'E.M. Bodoquena',
          position: { lat: -12.7256, lng: -60.1606 },
          capacity: 220,
          occupied: 200,
          waitingList: 38,
          district: 'Jardim América',
          levels: ['Fundamental I', 'Fundamental II'],
          address: 'Rua Bodoquena, 567 - Jardim América',
          phone: '(69) 3321-4321'
        },
        {
          name: 'EMEI Pequeno Príncipe',
          position: { lat: -12.7606, lng: -60.1306 },
          capacity: 160,
          occupied: 140,
          waitingList: 22,
          district: 'Parque Industrial',
          levels: ['Educação Infantil'],
          address: 'Rua do Parque, 890 - Parque Industrial',
          phone: '(69) 3321-6789'
        }
      ];

      // Adicionar marcador da localização do usuário se disponível
      if (userDistrictName && districtCoordinates[userDistrictName]) {
        const userMarker = new window.google.maps.Marker({
          position: districtCoordinates[userDistrictName],
          map: map,
          title: 'Sua localização',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#1e40af',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });

        const userInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">📍 Sua Localização</h3>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">${userDistrictName}</p>
            </div>
          `
        });

        userMarker.addListener('click', () => {
          userInfoWindow.open(map, userMarker);
        });
      }

      // Calcular distância do usuário para cada escola
      const userPosition = userDistrictName && districtCoordinates[userDistrictName] 
        ? districtCoordinates[userDistrictName] 
        : mapCenter;

      const schoolsWithDistance = schools.map(school => {
        const distance = calculateDistance(
          userPosition.lat, userPosition.lng,
          school.position.lat, school.position.lng
        );
        return { ...school, distance };
      });

      // Ordenar escolas por proximidade
      schoolsWithDistance.sort((a, b) => a.distance - b.distance);

      // Adicionar marcadores das escolas
      schoolsWithDistance.forEach((school, index) => {
        const occupancyRate = (school.occupied / school.capacity) * 100;
        const isNearby = school.distance <= 2; // Escolas a até 2km são consideradas próximas
        
        // Definir cor baseada na proximidade e ocupação
        let color = '#6b7280'; // Cinza para escolas distantes
        if (isNearby) {
          if (occupancyRate > 90) color = '#ef4444'; // Vermelho (alta ocupação)
          else if (occupancyRate > 75) color = '#f59e0b'; // Amarelo (média ocupação)
          else color = '#10b981'; // Verde (baixa ocupação)
        }

        const marker = new window.google.maps.Marker({
          position: school.position,
          map: map,
          title: school.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: isNearby ? 10 + (3 - index) : 6, // Escolas próximas são maiores
            fillColor: color,
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // InfoWindow com informações da escola
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui; max-width: 280px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${school.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${school.address}</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">📞 ${school.phone}</p>
              
              <div style="margin: 8px 0;">
                <div style="font-size: 14px; color: #374151; margin-bottom: 4px;">
                  <strong>Distância:</strong> ${school.distance.toFixed(1)} km
                </div>
                <div style="font-size: 14px; color: #374151; margin-bottom: 4px;">
                  <strong>Capacidade:</strong> ${school.capacity} alunos
                </div>
                <div style="font-size: 14px; color: #374151; margin-bottom: 4px;">
                  <strong>Ocupação:</strong> ${school.occupied} alunos (${Math.round(occupancyRate)}%)
                </div>
                <div style="font-size: 14px; color: #374151; margin-bottom: 4px;">
                  <strong>Fila de espera:</strong> ${school.waitingList} alunos
                </div>
                <div style="font-size: 14px; color: #374151; margin-bottom: 8px;">
                  <strong>Vagas disponíveis:</strong> ${school.capacity - school.occupied}
                </div>
              </div>

              <div style="margin: 8px 0;">
                <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;"><strong>Níveis de Ensino:</strong></div>
                ${school.levels.map(level => `<span style="display: inline-block; background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 12px; font-size: 11px; margin: 2px;">${level}</span>`).join('')}
              </div>

              <div style="margin-top: 8px; padding: 4px 8px; background-color: ${color}20; border-radius: 4px; font-size: 12px; color: ${color}; font-weight: 500;">
                ${isNearby ? 
                  (occupancyRate > 90 ? '🔴 Escola Próxima - Alta Demanda' : 
                   occupancyRate > 75 ? '🟡 Escola Próxima - Demanda Moderada' : 
                   '🟢 Escola Próxima - Vagas Disponíveis') :
                  '⚪ Escola Distante'
                }
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      // Adicionar legenda recolhível
      const legendContainer = document.createElement('div');
      legendContainer.style.cssText = `
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-family: system-ui;
        margin: 10px;
        min-width: 200px;
        max-width: 280px;
        overflow: hidden;
      `;

      const legendHeader = document.createElement('div');
      legendHeader.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        cursor: pointer;
      `;

      const legendTitle = document.createElement('h4');
      legendTitle.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      `;
      legendTitle.textContent = 'Legenda';

      const toggleButton = document.createElement('button');
      toggleButton.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      toggleButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;

      const legendContent = document.createElement('div');
      legendContent.style.cssText = `
        padding: 16px;
        transition: all 0.3s ease;
      `;
      
      legendContent.innerHTML = `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 16px; height: 16px; background-color: #1e40af; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #1e40af;"></div>
            <span style="font-size: 14px; color: #374151;">Sua Localização</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 16px; height: 16px; background-color: #10b981; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #10b981;"></div>
            <span style="font-size: 14px; color: #374151;">Escola Próxima - Vagas Disponíveis</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 16px; height: 16px; background-color: #f59e0b; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #f59e0b;"></div>
            <span style="font-size: 14px; color: #374151;">Escola Próxima - Demanda Moderada</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <div style="width: 16px; height: 16px; background-color: #ef4444; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #ef4444;"></div>
            <span style="font-size: 14px; color: #374151;">Escola Próxima - Alta Demanda</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="width: 16px; height: 16px; background-color: #6b7280; border-radius: 50%; margin-right: 8px; border: 2px solid white; box-shadow: 0 0 0 1px #6b7280;"></div>
            <span style="font-size: 14px; color: #374151;">Escola Distante (>2km)</span>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <div style="font-size: 14px; font-weight: 500; color: #1f2937; margin-bottom: 6px;">Sistema de Alocação Inteligente:</div>
            <div style="font-size: 13px; color: #6b7280;">
              1. Prioridade Social (Bolsa Família)<br>
              2. Proximidade Geográfica<br>
              3. Ordem Cronológica
            </div>
          </div>
        </div>
      `;

      legendHeader.appendChild(legendTitle);
      legendHeader.appendChild(toggleButton);
      legendContainer.appendChild(legendHeader);
      legendContainer.appendChild(legendContent);

      // Função para alternar visibilidade da legenda
      const toggleLegend = () => {
        if (legendContent.style.display === 'none') {
          legendContent.style.display = 'block';
          toggleButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          `;
        } else {
          legendContent.style.display = 'none';
          toggleButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          `;
        }
      };

      legendHeader.addEventListener('click', toggleLegend);

      // Definir visibilidade inicial baseada no estado
      if (!legendVisible) {
        legendContent.style.display = 'none';
        toggleButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
      }

      map.controls[window.google.maps.ControlPosition.LEFT_BOTTOM].push(legendContainer);
    };

    // Função para calcular distância entre dois pontos
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Raio da Terra em km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
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
  }, [user, userDistrict, legendVisible]);

  return (
    <div 
      ref={mapRef} 
      className={`${className} rounded-lg border border-gray-200`}
      style={{ minHeight: '256px' }}
    />
  );
};

export default ProximityMap;