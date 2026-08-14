import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";

// Bypass real Multer/Cloudinary upload — same approach as users-auth.test.ts
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

// Avoid a real Nominatim geocoding call
vi.mock("../util/location", () => ({
  default: vi.fn().mockResolvedValue({ lat: 40.748817, lng: -73.985428 }),
}));

const signupAndLogin = async (email: string) => {
  const signupRes = await request(app).post("/api/users/signup").send({
    firstName: "Test",
    lastName: "User",
    birthday: "1995-05-20",
    gender: "female",
    email,
    password: "password123",
  });

  return { userId: signupRes.body.userId, token: signupRes.body.token };
};

const validPlaceBody = {
  title: "Empire State Building",
  description: "A famous NYC skyscraper.",
  address: "20 W 34th St, New York, NY 10001",
};

describe("Places CRUD", () => {
  let ownerToken: string;
  let ownerId: string;
  let otherToken: string;

  beforeEach(async () => {
    const owner = await signupAndLogin("owner@example.com");
    ownerToken = owner.token;
    ownerId = owner.userId;

    const other = await signupAndLogin("other@example.com");
    otherToken = other.token;
  });

  it("rejects place creation with no auth token", async () => {
    const res = await request(app).post("/api/places").send(validPlaceBody);
    expect(res.status).toBe(403);
  });

  it("creates a place for the authenticated user", async () => {
    const res = await request(app)
      .post("/api/places")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(validPlaceBody);

    expect(res.status).toBe(201);
    expect(res.body.place.title).toBe(validPlaceBody.title);
    expect(res.body.place.creator).toBe(ownerId);
  });

  it("lets the owner update their own place", async () => {
    const createRes = await request(app)
      .post("/api/places")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(validPlaceBody);
    const placeId = createRes.body.place._id;

    const updateRes = await request(app)
      .patch(`/api/places/${placeId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Updated Title", description: "An updated description." });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.place.title).toBe("Updated Title");
  });

  it("blocks a non-owner from updating the place", async () => {
    const createRes = await request(app)
      .post("/api/places")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(validPlaceBody);
    const placeId = createRes.body.place._id;

    const updateRes = await request(app)
      .patch(`/api/places/${placeId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hijacked Title", description: "Should not be allowed." });

    expect(updateRes.status).toBe(401);
  });

  it("blocks a non-owner from deleting the place", async () => {
    const createRes = await request(app)
      .post("/api/places")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(validPlaceBody);
    const placeId = createRes.body.place._id;

    const deleteRes = await request(app)
      .delete(`/api/places/${placeId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(deleteRes.status).toBe(401);
  });

  it("lets the owner delete their own place", async () => {
    const createRes = await request(app)
      .post("/api/places")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(validPlaceBody);
    const placeId = createRes.body.place._id;

    const deleteRes = await request(app)
      .delete(`/api/places/${placeId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/places/${placeId}`);
    expect(getRes.status).toBe(404);
  });
});
