// In your frontend (index.tsx or a separate API utility file)
const BACKEND_URL = "http://192.168.1.6:8000";

export async function getRoutes(startLat, startLng, endLat, endLng) {
  const url = `${BACKEND_URL}/routes?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch routes');
  }
  const data = await response.json();
  return data.routes;
}

