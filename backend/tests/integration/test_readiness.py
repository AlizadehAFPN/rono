from httpx import AsyncClient


async def test_readiness_with_live_services(client: AsyncClient) -> None:
    response = await client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["checks"]["postgres"] == "ok"
    assert data["checks"]["redis"] == "ok"
