import request from "supertest";
import app from "../app";

describe("GET /", () => {
  it("returns service metadata", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "API 서버 작동중",
      database: expect.objectContaining({
        host: expect.any(String),
        name: expect.any(String),
      }),
    });
  });
});

