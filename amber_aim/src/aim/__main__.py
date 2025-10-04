"""Application entry point for running the FastAPI server."""

import uvicorn

from aim.config import Settings

if __name__ == "__main__":
    settings = Settings()
    uvicorn.run(
        "aim.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload for development
    )
