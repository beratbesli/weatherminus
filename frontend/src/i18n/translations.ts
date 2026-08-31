export type Language = 'en' | 'tr' | 'de' | 'es';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  drillButton: string;
  drillingButton: string;
  searchPlaceholder: string;
  myLocation: string;
  distanceLabel: string;
  yourLocation: string;
  antipodeLocation: string;
  googleMaps: string;
  feelsLike: string;
  humidity: string;
  wind: string;
  pressure: string;
  oceanographyTitle: string;
  maxWave: string;
  wavePeriod: string;
  seabedDepth: string;
  landNotice: string;
  calmCondition: string;
  weatherUnavailable: string;
  marineLoading: string;
  originZone: string;
  oceanZone: string;
  landZone: string;
  antipodeSummary: (lat: number, lon: number, isLand: boolean) => string;
  commentary: {
    freezing: string;
    chilly: string;
    thunderstorm: string;
    rain: string;
    snow: string;
    hot: string;
    pleasant: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'WEATHERMINUS 3D',
    appSubtitle: 'Earth Antipode & Ocean Platform',
    drillButton: 'Drill Through Earth',
    drillingButton: 'Drilling Earth Core...',
    searchPlaceholder: 'Search any city (e.g. Tokyo, Istanbul, New York, London)...',
    myLocation: 'My Location',
    distanceLabel: 'Distance: 20,015 km (Earth Diameter)',
    yourLocation: 'Your Location',
    antipodeLocation: 'Exact Opposite Point (Antipode)',
    googleMaps: 'Google Maps',
    feelsLike: 'Feels Like',
    humidity: 'Humidity',
    wind: 'Wind',
    pressure: 'Pressure',
    oceanographyTitle: 'Oceanography & Waves',
    maxWave: 'Max Wave',
    wavePeriod: 'Wave Period',
    seabedDepth: 'Seabed Depth',
    landNotice: 'Terrestrial Land Point (Solid ground, no ocean).',
    calmCondition: 'Calm',
    weatherUnavailable: 'Weather telemetry currently unavailable.',
    marineLoading: 'Marine telemetry loading...',
    originZone: 'Origin Location',
    oceanZone: 'Middle of the Ocean / Remote Area',
    landZone: 'Terrestrial Land',
    antipodeSummary: (lat, lon, isLand) =>
      `Antipode coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) located in ${isLand ? 'Land' : 'Open Ocean'}.`,
    commentary: {
      freezing: "It's freezing icy cold there! Bundle up in warm layers.",
      chilly: "It's pretty chilly over there! Be glad for a warm place.",
      thunderstorm: 'Thunderstorms roaring right now! Stay safe inside.',
      rain: "It's raining over there! Grab an umbrella if you are out.",
      snow: 'Snow is falling there! A true winter wonderland.',
      hot: 'Scorching heat! Stay hydrated and find some shade.',
      pleasant: 'The weather looks pleasant and calm!',
    },
  },
  tr: {
    appTitle: 'WEATHERMINUS 3D',
    appSubtitle: 'Dünya Karşıt Noktası ve Okyanus Platformu',
    drillButton: "Dünya'nın İçinden Geç",
    drillingButton: 'Dünya Çekirdeği Deliniyor...',
    searchPlaceholder: 'Bir şehir arayın (örn. İstanbul, Tokyo, New York, Ankara)...',
    myLocation: 'Konumum',
    distanceLabel: 'Mesafe: 20.015 km (Dünya Çapı)',
    yourLocation: 'Bulunduğunuz Konum',
    antipodeLocation: 'Tam Karşıt Noktanız (Antipot)',
    googleMaps: 'Haritada Aç',
    feelsLike: 'Hissedilen',
    humidity: 'Nem Oranı',
    wind: 'Rüzgar',
    pressure: 'Basınç',
    oceanographyTitle: 'Oşinografi ve Dalga Durumu',
    maxWave: 'Maks Dalga',
    wavePeriod: 'Dalga Periyodu',
    seabedDepth: 'Deniz Derinliği',
    landNotice: 'Karasal Bölge (Açık deniz suyu bulunmuyor).',
    calmCondition: 'Sakin',
    weatherUnavailable: 'Bu nokta için hava durumu verisi alınamadı.',
    marineLoading: 'Deniz verileri yükleniyor...',
    originZone: 'Başlangıç Konumu',
    oceanZone: 'Okyanusun Ortası / Açık Deniz',
    landZone: 'Karasal Bölge',
    antipodeSummary: (lat, lon, isLand) =>
      `Karşıt nokta (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) ${isLand ? 'Karaya' : 'Açık Okyanusa'} denk gelmektedir.`,
    commentary: {
      freezing: 'Orası buz gibi dondurucu! Sıcak bir yerde olduğunuza sevinin.',
      chilly: 'Hava oldukça serin! Sıkı giyinmekte fayda var.',
      thunderstorm: 'Orada şu an gök gürültülü fırtına var! Güvende kalın.',
      rain: 'Şu an oraya yağmur yağıyor! Şemsiyenizi unutmayın.',
      snow: 'Kar yağışı var! Tam bir kış manzarası hakim.',
      hot: 'Kavurucu bir sıcaklık var! Bol su tüketin ve gölgede kalın.',
      pleasant: 'Hava oldukça sakin, ferah ve güzel görünüyor!',
    },
  },
  de: {
    appTitle: 'WEATHERMINUS 3D',
    appSubtitle: 'Erd-Antipoden & Ozean-Plattform',
    drillButton: 'Durch die Erde bohren',
    drillingButton: 'Erdkern wird durchbohrt...',
    searchPlaceholder: 'Stadt suchen (z. B. Berlin, Tokio, Wien, Zürich)...',
    myLocation: 'Mein Standort',
    distanceLabel: 'Entfernung: 20.015 km (Erd-Durchmesser)',
    yourLocation: 'Ihr Standort',
    antipodeLocation: 'Exakter Gegenpunkt (Antipode)',
    googleMaps: 'Auf Google Maps ansehen',
    feelsLike: 'Gefühlt',
    humidity: 'Luftfeuchtigkeit',
    wind: 'Wind',
    pressure: 'Luftdruck',
    oceanographyTitle: 'Ozeanographie & Wellengang',
    maxWave: 'Max. Welle',
    wavePeriod: 'Wellenperiode',
    seabedDepth: 'Meeresbodentiefe',
    landNotice: 'Festlandpunkt (Kein offenes Meerwasser).',
    calmCondition: 'Ruhig',
    weatherUnavailable: 'Wetterdaten derzeit nicht verfügbar.',
    marineLoading: 'Meeresdaten werden geladen...',
    originZone: 'Ausgangsort',
    oceanZone: 'Mitten im Ozean / Abgelegenes Gebiet',
    landZone: 'Festland',
    antipodeSummary: (lat, lon, isLand) =>
      `Antipoden-Koordinaten (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) liegen auf ${isLand ? 'dem Festland' : 'dem offenen Ozean'}.`,
    commentary: {
      freezing: 'Dort ist es eiskalt! Ziehen Sie sich warm an.',
      chilly: 'Es ist ziemlich kühl dort drüben.',
      thunderstorm: 'Dort toben gerade Gewitter! Bleiben Sie drinnen.',
      rain: 'Es regnet dort! Vergessen Sie den Regenschirm nicht.',
      snow: 'Dort schneit es! Eine echte Winterlandschaft.',
      hot: 'Glühende Hitze! Bleiben Sie hydriert.',
      pleasant: 'Das Wetter sieht angenehm und ruhig aus!',
    },
  },
  es: {
    appTitle: 'WEATHERMINUS 3D',
    appSubtitle: 'Plataforma de Antípodas y Océanos',
    drillButton: 'Taladrar el Centro de la Tierra',
    drillingButton: 'Perforando el Núcleo...',
    searchPlaceholder: 'Buscar ciudad (ej. Madrid, Tokio, Buenos Aires, México)...',
    myLocation: 'Mi Ubicación',
    distanceLabel: 'Distancia: 20.015 km (Diámetro Terrestre)',
    yourLocation: 'Tu Ubicación',
    antipodeLocation: 'Punto Exactamente Opuesto (Antípoda)',
    googleMaps: 'Ver en Google Maps',
    feelsLike: 'Sensación',
    humidity: 'Humedad',
    wind: 'Viento',
    pressure: 'Presión',
    oceanographyTitle: 'Oceanografía y Olas',
    maxWave: 'Ola Máx.',
    wavePeriod: 'Período de Ola',
    seabedDepth: 'Profundidad Marina',
    landNotice: 'Punto Terrestre (Tierra firme, sin mar abierto).',
    calmCondition: 'Calma',
    weatherUnavailable: 'Datos meteorológicos no disponibles.',
    marineLoading: 'Cargando datos marinos...',
    originZone: 'Ubicación de Origen',
    oceanZone: 'En Medio del Océano / Zona Remota',
    landZone: 'Tierra Firme',
    antipodeSummary: (lat, lon, isLand) =>
      `Coordenadas de la antípoda (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) ubicadas en ${isLand ? 'Tierra' : 'Océano Abierto'}.`,
    commentary: {
      freezing: '¡Hace un frío helado allí! Abrígate bien.',
      chilly: '¡Hace bastante frío por allí!',
      thunderstorm: '¡Tormentas eléctricas ahora mismo! Mantente a salvo.',
      rain: '¡Está lloviendo allí! Lleva un paraguas si sales.',
      snow: '¡Está cayendo nieve! Un verdadero paisaje invernal.',
      hot: '¡Calor abrasador! Mantente hidratado y a la sombra.',
      pleasant: '¡El clima se ve agradable y tranquilo!',
    },
  },
};
