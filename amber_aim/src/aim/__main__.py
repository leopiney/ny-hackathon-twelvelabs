"""Application entry point for running the FastAPI server."""

import os
import uvicorn

from aim.config import Settings

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)

    settings = Settings()
    # Disable reload in production (Docker)
    is_dev = os.getenv("ENV", "production") == "development"
    uvicorn.run(
        "aim.main:app",
        host="0.0.0.0",
        port=8000,
        reload=is_dev,  # Enable auto-reload only in development
    )
