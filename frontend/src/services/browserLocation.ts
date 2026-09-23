export interface BrowserLocation {
  latitude: number;
  longitude: number;
}

export function getBrowserLocation(
  geolocation: Geolocation | undefined = globalThis.navigator?.geolocation,
): Promise<BrowserLocation> {
  if (!geolocation) {
    return Promise.reject(new Error('Browser geolocation is unavailable'));
  }

  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      reject,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}
