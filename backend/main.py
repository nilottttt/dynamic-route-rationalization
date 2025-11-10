from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.routes_api import router as routes_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes router
app.include_router(routes_router)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.on_event("startup")
def startup_event():
    print("=== Registered Routes ===")
    for route in app.routes:
        print(f"{route.methods} {route.path}")
    print("========================")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
