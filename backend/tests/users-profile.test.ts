import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

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

const signupAndLogin = async (email: string, password = "password123") => {
  const res = await request(app).post("/api/users/signup").send({
    firstName: "Test",
    lastName: "User",
    birthday: "1995-05-20",
    gender: "female",
    email,
    password,
  });
  return { userId: res.body.userId, token: res.body.token };
};

describe("GET /api/users", () => {
  it("returns all users without sensitive fields", async () => {
    await signupAndLogin("alice@example.com");
    await signupAndLogin("bob@example.com");

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    for (const user of res.body.users) {
      expect(user).not.toHaveProperty("password");
      expect(user).not.toHaveProperty("resetPasswordToken");
      expect(user).not.toHaveProperty("resetPasswordExpires");
    }
  });

  it("returns users sorted with the most recently created first", async () => {
    await signupAndLogin("first@example.com");
    await signupAndLogin("second@example.com");

    const res = await request(app).get("/api/users");

    expect(res.body.users[0].email).toBe("second@example.com");
    expect(res.body.users[1].email).toBe("first@example.com");
  });

  it("returns pagination metadata alongside the users", async () => {
  await signupAndLogin("pag1@example.com");
  await signupAndLogin("pag2@example.com");

  const res = await request(app).get("/api/users");

  expect(res.status).toBe(200);
  expect(res.body.pagination).toEqual({
    currentPage: 1,
    totalPages: 1,
    totalCount: 2,
    hasMore: false,
  });
});

it("respects the limit query param and reports hasMore correctly", async () => {
  await signupAndLogin("lim1@example.com");
  await signupAndLogin("lim2@example.com");
  await signupAndLogin("lim3@example.com");

  const res = await request(app).get("/api/users?limit=2");

  expect(res.status).toBe(200);
  expect(res.body.users).toHaveLength(2);
  expect(res.body.pagination).toEqual({
    currentPage: 1,
    totalPages: 2,
    totalCount: 3,
    hasMore: true,
  });
});

it("returns the second page correctly", async () => {
  await signupAndLogin("page1@example.com");
  await signupAndLogin("page2@example.com");
  await signupAndLogin("page3@example.com");

  const res = await request(app).get("/api/users?page=2&limit=2");

  expect(res.status).toBe(200);
  expect(res.body.users).toHaveLength(1); // 3 total, 2 on page 1, 1 remaining
  expect(res.body.pagination.currentPage).toBe(2);
  expect(res.body.pagination.hasMore).toBe(false);
});
});

describe("GET /api/users/:uid", () => {
  it("returns a single user without sensitive fields", async () => {
    const { userId } = await signupAndLogin("solo@example.com");

    const res = await request(app).get(`/api/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("solo@example.com");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("returns 404 for a nonexistent user id", async () => {
    const res = await request(app).get("/api/users/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/users/:uid", () => {
  const updatedFields = {
    firstName: "Updated",
    lastName: "Name",
    birthday: "1995-05-20",
    gender: "male",
    email: "updated@example.com",
  };

  it("lets the owner update their own profile", async () => {
    const { userId, token } = await signupAndLogin("owner@example.com");

    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedFields);

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe("Updated");
    expect(res.body.user.email).toBe("updated@example.com");
  });

  it("blocks a user from updating someone else's profile", async () => {
    const { userId: ownerId } = await signupAndLogin("owner2@example.com");
    const { token: otherToken } = await signupAndLogin("other2@example.com");

    const res = await request(app)
      .patch(`/api/users/${ownerId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send(updatedFields);

    expect(res.status).toBe(403);
  });

  it("rejects updating to an email already used by another account", async () => {
    const { userId, token } = await signupAndLogin("taken-check@example.com");
    await signupAndLogin("already-taken@example.com");

    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...updatedFields, email: "already-taken@example.com" });

    expect(res.status).toBe(422);
  });

  it("rejects invalid input", async () => {
    const { userId, token } = await signupAndLogin("invalid-update@example.com");

    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...updatedFields, firstName: "" });

    expect(res.status).toBe(422);
  });
});

describe("PATCH /api/users/:uid/password", () => {
  it("lets the owner change their password with the correct current password", async () => {
    const { userId, token } = await signupAndLogin("changepw@example.com", "oldpassword123");

    const res = await request(app)
      .patch(`/api/users/${userId}/password`)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "oldpassword123", newPassword: "newpassword456" });

    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post("/api/users/login")
      .send({ email: "changepw@example.com", password: "newpassword456" });
    expect(loginRes.status).toBe(200);
  });

  it("rejects an incorrect current password", async () => {
    const { userId, token } = await signupAndLogin("wrongcurrent@example.com", "oldpassword123");

    const res = await request(app)
      .patch(`/api/users/${userId}/password`)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "notright", newPassword: "newpassword456" });

    expect(res.status).toBe(401);
  });

  it("blocks a user from changing someone else's password", async () => {
    const { userId: ownerId } = await signupAndLogin("pwowner@example.com", "oldpassword123");
    const { token: otherToken } = await signupAndLogin("pwother@example.com");

    const res = await request(app)
      .patch(`/api/users/${ownerId}/password`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ currentPassword: "oldpassword123", newPassword: "newpassword456" });

    expect(res.status).toBe(403);
  });
});
