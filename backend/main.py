from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from agents.free_agent import run_free_agent
from agents.governed_agent import run_governed_agent
from database.db import get_audit_log, get_metrics, init_db
from pydantic import BaseModel
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AEGIS Governance Lab API",
    description="Demo de gobernanza de agentes IA — powered by AEGIS Initiative",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


class ActionRequest(BaseModel):
    action: str
    scenario: str = ""


@app.post("/agent/free")
async def free_agent(req: ActionRequest):
    """Agente sin gobernanza — ejecuta todo sin validar."""
    return await run_free_agent(req.action)


@app.post("/agent/governed")
async def governed_agent(req: ActionRequest):
    """Agente gobernado por AEGIS — toda accion pasa por AGP 1."""
    return await run_governed_agent(req.action)


@app.get("/audit/log")
async def audit_log(
    limit: int = Query(50, le=500),
    verdict: str = Query(None),
):
    """Retorna el audit trail completo o filtrado por veredicto."""
    return await get_audit_log(limit=limit, verdict=verdict)


@app.get("/audit/metrics")
async def metrics():
    """Metricas agregadas para el dashboard."""
    return await get_metrics()


@app.get("/health")
async def health():
    return {"status": "ok", "aegis_core": "active", "llm": "qwen3:8b@local"}
