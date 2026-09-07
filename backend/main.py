from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx, os, json

app = FastAPI(title="BUGDATA Agentic OS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CRM = os.getenv("CRM_URL", "http://localhost:8765")

@app.get("/api/health")
async def health():
    return {"ok": True, "service": "bugdata-agentic-os"}

@app.get("/api/crm/contacts")
async def crm_contacts():
    try:
        async with httpx.AsyncClient() as c:
            r = await c.get(f"{CRM}/api/contacts", timeout=5)
            return JSONResponse(content=r.json(), status_code=r.status_code)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=502)

@app.post("/api/crm/webhook")
async def crm_webhook(request: Request):
    try:
        payload = await request.json()
        async with httpx.AsyncClient() as c:
            r = await c.post(f"{CRM}/webhook/whatsapp", json=payload, timeout=10)
            return JSONResponse(content=r.json(), status_code=r.status_code)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=502)

@app.get("/api/marketplace/listings")
async def marketplace_listings():
    try:
        url = "https://eqvunpxereqqqgumotid.supabase.co/rest/v1/listings?select=*&order=created_at.desc&limit=20"
        headers = {"apikey": "sb_publishable_pIKmOBGR-Jyyih5D6rHV5A_C7BxYpGU", "Authorization": "Bearer sb_publishable_pIKmOBGR-Jyyih5D6rHV5A_C7BxYpGU"}
        async with httpx.AsyncClient() as c:
            r = await c.get(url, headers=headers, timeout=10)
            return JSONResponse(content=r.json(), status_code=r.status_code)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=502)

@app.post("/api/agents/command")
async def agent_command(request: Request):
    body = await request.json()
    command = body.get("command", "").lower().strip()
    if not command:
        return JSONResponse(content={"error": "No command provided"}, status_code=400)
    if "lead" in command or "crm" in command:
        return JSONResponse(content={"agent": "KYLA", "action": "route", "message": "Routing lead to CRM pipeline."})
    if "listing" in command or "market" in command:
        return JSONResponse(content={"agent": "Funnel", "action": "create_listing", "message": "Ready to create marketplace listing."})
    if "campaign" in command or "market" in command:
        return JSONResponse(content={"agent": "Marketing", "action": "launch_campaign", "message": "Campaign framework prepared."})
    return JSONResponse(content={"agent": "Hermes", "action": "unknown", "message": "Command received. Need more specificity."})
