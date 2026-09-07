from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx, os, json

app = FastAPI(title="BUGDATA Agentic OS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CRM = os.getenv("CRM_URL", "http://localhost:8765")
app.mount("/assets", StaticFiles(directory="../assets"), name="assets")

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

@app.get("/api/dashboard/summary")
async def dashboard_summary():
    try:
        async with httpx.AsyncClient() as c:
            r = await c.get(f"{CRM}/api/contacts", timeout=5)
            contacts = r.json() if r.ok else []
    except Exception:
        contacts = []

    total = len(contacts) if isinstance(contacts, list) else 0
    pipeline = []
    if isinstance(contacts, list):
        statuses = {}
        for item in contacts:
            st = item.get("status") or item.get("role") or "unknown"
            statuses[st] = statuses.get(st, 0) + 1
        pipeline = [{"label": k, "count": v} for k, v in statuses.items()]

    return {
        "week": {
            "leads": total,
            "qualified": next((x["count"] for x in pipeline if x["label"].lower() in ("qualified", "vip", "client")), 0),
            "consultations": 0,
            "awaiting_approval": 0,
        },
        "pipeline": pipeline,
        "agents": [
            {"name": "Kyla", "state": "Answering new leads", "status": "working"},
            {"name": "Marketing Agent", "state": "Awaiting your approval", "status": "approval"},
            {"name": "Funnel Agent", "state": "Editing pricing section", "status": "working"},
            {"name": "Hermes", "state": "Idle — no tasks queued", "status": "idle"},
            {"name": "Analytics Agent", "state": "Next report Friday", "status": "idle"},
        ],
    }

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("../assets/index.html") as f:
        return f.read()

@app.get("/dashboard.html", response_class=HTMLResponse)
async def dashboard():
    with open("../assets/dashboard.html") as f:
        return f.read()
