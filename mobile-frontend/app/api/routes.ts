const BACKEND_URL = "http://192.168.1.6:8000"; // Android emulator
// const BACKEND_URL = "http://localhost:8000"; // iOS simulator

export interface Route {
  distance: number;
  duration: number;
  geometry: string;
  steps: any[];
}

export async function getRoutes(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<Route[]> {
  const url = `${BACKEND_URL}/routes?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`;
  
  console.log('Fetching from URL:', url); // Debug log
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.routes;
}
