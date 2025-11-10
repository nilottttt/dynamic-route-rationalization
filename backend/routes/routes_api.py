from fastapi import APIRouter, Query
import requests

router = APIRouter()

OSRM_URL = "http://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&alternatives=true&steps=true&annotations=duration,distance"

@router.get("/routes")
def get_routes(
    start_lat: float = Query(...), 
    start_lng: float = Query(...), 
    end_lat: float = Query(...), 
    end_lng: float = Query(...)
):
    url = OSRM_URL.format(
        start_lng=start_lng, start_lat=start_lat, end_lng=end_lng, end_lat=end_lat
    )
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        osrm_data = response.json()

        routes = []
        for route in osrm_data.get("routes", []):
            routes.append({
                "distance": route["distance"],
                "duration": route["duration"],
                "geometry": route["geometry"],
                "steps": route["legs"][0]["steps"] if "legs" in route else [],
            })
        return {"routes": routes}
    except Exception as e:
        return {"error": str(e), "routes": []}
