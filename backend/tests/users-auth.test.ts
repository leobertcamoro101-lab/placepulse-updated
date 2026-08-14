import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../app";

// Bypass real Multer/Cloudinary upload in tests — signup just needs *a* req.file
// with the fields the controller reads, not a real uploaded image.
vi.mock("../middleware/file-upload", () => ({
  upload: {
    single: () => (req: any, res: any, next: any) => next(),
  },
  uploadToCloudinary: (req: any, res: any, next: any) => {
    req.file = {
      cloudinaryUrl:
        "https://res.cloudinary.com/test/image/upload/v1/placepulse-updated/testimage.jpg",
      cloudinaryPublicId: "placepulse-updated/testimage",
    };
    next();
  },
}));

// No-op cleanup so failed-path tests don't try to call real Cloudinary
vi.mock("../util/cloudinary-cleanup", () => ({
  deleteCloudinaryImage: vi.fn().mockResolvedValue(undefined),
  extractPublicId: vi.fn().mockReturnValue(null),
}));

const validSignupBody = {
  firstName: "Jane",
  lastName: "Doe",
  birthday: "1995-05-20",
  gender: "female",
  email: "jane.doe@example.com",
  password: "password123",
};

describe("POST /api/users/signup", () => {
  it("creates a user and returns a token", async () => {
    const res = await request(app).post("/api/users/signup").send(validSignupBody);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toBe(validSignupBody.email);
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body).not.toHaveProperty("password");
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/users/signup").send(validSignupBody);

    const res = await request(app).post("/api/users/signup").send(validSignupBody);

    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/already/i);
  });

  it("rejects invalid input (bad email)", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({ ...validSignupBody, email: "not-an-email" });

    expect(res.status).toBe(422);
  });
});

describe("POST /api/users/login", () => {
  it("logs in with correct credentials", async () => {
    await request(app).post("/api/users/signup").send(validSignupBody);

    const res = await request(app).post("/api/users/login").send({
      email: validSignupBody.email,
      password: validSignupBody.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toBe(validSignupBody.email);
  });

  it("rejects an incorrect password", async () => {
    await request(app).post("/api/users/signup").send(validSignupBody);

    const res = await request(app).post("/api/users/login").send({
      email: validSignupBody.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(403);
  });

  it("rejects a login for a nonexistent email", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(403);
  });
});

describe("Protected routes", () => {
  it("rejects a request with no auth token", async () => {
    const res = await request(app)
      .patch("/api/users/000000000000000000000000/password")
      .send({ currentPassword: "x", newPassword: "y" });

    expect(res.status).toBe(403);
  });
});
