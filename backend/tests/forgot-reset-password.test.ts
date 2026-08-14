import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import sendResetPasswordEmail from "../util/brevo-email";

// Don't send real emails in tests — capture the (email, rawToken) args instead
// so tests can drive the full forgot -> reset -> login round trip.
vi.mock("../util/brevo-email", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Signup needs the multer/Cloudinary upload middleware — same bypass used
// in users-auth.test.ts.
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

vi.mock("../util/cloudinary-cleanup", () => ({
  deleteCloudinaryImage: vi.fn().mockResolvedValue(undefined),
  extractPublicId: vi.fn().mockReturnValue(null),
}));

const signup = async (email: string, password = "password123") => {
  return request(app).post("/api/users/signup").send({
    firstName: "Test",
    lastName: "User",
    birthday: "1995-05-20",
    gender: "female",
    email,
    password,
  });
};

describe("POST /api/users/forgot-password", () => {
  beforeEach(() => {
    vi.mocked(sendResetPasswordEmail).mockClear();
  });

  it("sends a reset email for an existing user", async () => {
    await signup("forgot@example.com");

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "forgot@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if that email exists/i);
    expect(sendResetPasswordEmail).toHaveBeenCalledTimes(1);
    expect(sendResetPasswordEmail).toHaveBeenCalledWith(
      "forgot@example.com",
      expect.any(String)
    );
  });

  it("responds the same way for a nonexistent email, without sending an email", async () => {
    // Same response for existing and nonexistent emails — this is a
    // deliberate privacy choice in the controller, not an oversight.
    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "nobody@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if that email exists/i);
    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
  });
});

describe("POST /api/users/reset-password", () => {
  beforeEach(() => {
    vi.mocked(sendResetPasswordEmail).mockClear();
  });

  it("resets the password with a valid token and allows login with the new password", async () => {
    await signup("reset@example.com", "oldpassword123");

    await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "reset@example.com" });

    // Grab the raw token the (mocked) email would have contained
    const rawToken = vi.mocked(sendResetPasswordEmail).mock.calls[0][1];

    const resetRes = await request(app)
      .post("/api/users/reset-password")
      .send({ token: rawToken, password: "newpassword456" });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.message).toMatch(/password has been reset/i);

    const oldLoginRes = await request(app)
      .post("/api/users/login")
      .send({ email: "reset@example.com", password: "oldpassword123" });
    expect(oldLoginRes.status).toBe(403);

    const newLoginRes = await request(app)
      .post("/api/users/login")
      .send({ email: "reset@example.com", password: "newpassword456" });
    expect(newLoginRes.status).toBe(200);
  });

  it("rejects an invalid token", async () => {
    const res = await request(app)
      .post("/api/users/reset-password")
      .send({ token: "not-a-real-token", password: "somepassword123" });

    expect(res.status).toBe(400);
  });

  it("rejects a token that has already been used", async () => {
    await signup("reuse@example.com", "oldpassword123");

    await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "reuse@example.com" });

    const rawToken = vi.mocked(sendResetPasswordEmail).mock.calls[0][1];

    await request(app)
      .post("/api/users/reset-password")
      .send({ token: rawToken, password: "newpassword456" });

    // resetPassword clears the token on success, so reusing it must fail
    const secondRes = await request(app)
      .post("/api/users/reset-password")
      .send({ token: rawToken, password: "anotherpassword789" });

    expect(secondRes.status).toBe(400);
  });
});
