"""
FastAPI Main Application Entry Point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from backend.api.routes import router as api_router
from backend.api.websocket import ws_router

app = FastAPI(
    title="AI Motion & Biomechanics Intelligence Platform",
    description="Production-grade real-time fitness pose tracking, kinetic analysis, and form correction API.",
    version="1.0.0"
)

# CORS middleware for seamless local and remote client integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router)
app.include_router(ws_router)

# Mount frontend static directory if exists
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/")
async def serve_index():
    index_file = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "status": "online",
        "service": "AI Motion & Biomechanics Platform",
        "endpoints": {
            "docs": "/docs",
            "exercises": "/api/exercises",
            "websocket": "/ws/live-session"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
