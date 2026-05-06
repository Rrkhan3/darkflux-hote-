from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.websocket_manager import manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    if channel not in ("kitchen", "admin", "customer"):
        await websocket.close(code=4001, reason="Invalid channel")
        return
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"type": "message", "data": data}, channel)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
