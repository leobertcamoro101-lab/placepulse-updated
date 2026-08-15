import { describe, it, expect, vi } from "vitest";
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

vi.mock("../util/location", () => ({
  default: vi.fn().mockResolvedValue({ lat: 40.748817, lng: -73.985428 }),
}));

const signupAndLogin = async (email: string) => {
  const res = await request(app).post("/api/users/signup").send({
    firstName: "Test",
    lastName: "User",
    birthday: "1995-05-20",
    gender: "female",
    email,
    password: "password123",
  });
  return { userId: res.body.userId, token: res.body.token };
};

const createPlace = async (token: string, title = "Central Park") => {
  const res = await request(app)
    .post("/api/places")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title,
      description: "A big park in NYC.",
      address: "New York, NY",
    });
  return res.body.place;
};

describe("GET /api/places", () => {
  it("returns 404 when there are no places", async () => {
    const res = await request(app).get("/api/places");
    expect(res.status).toBe(404);
  });

  it("returns all places with populated creator info", async () => {
    const { token } = await signupAndLogin("creator@example.com");
    await createPlace(token, "Central Park");
    await createPlace(token, "Golden Gate Park");

    const res = await request(app).get("/api/places");

    expect(res.status).toBe(200);
    expect(res.body.places).toHaveLength(2);
    expect(res.body.places[0].creator.firstName).toBe("Test");
  });
});

describe("GET /api/places/:pid", () => {
  it("returns a single place", async () => {
    const { token } = await signupAndLogin("single@example.com");
    const place = await createPlace(token);

    const res = await request(app).get(`/api/places/${place._id}`);

    expect(res.status).toBe(200);
    expect(res.body.place.title).toBe("Central Park");
  });

  it("returns 404 for a nonexistent place id", async () => {
    const res = await request(app).get("/api/places/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/places/user/:uid", () => {
  it("returns the user's places with creator name/image attached", async () => {
    const { userId, token } = await signupAndLogin("hasplaces@example.com");
    await createPlace(token, "Central Park");
    await createPlace(token, "Golden Gate Park");

    const res = await request(app).get(`/api/places/user/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.places).toHaveLength(2);
    expect(res.body.places[0].creatorName).toBe("Test User");
  });

  it("returns 404 for a user with no places", async () => {
    const { userId } = await signupAndLogin("noplaces@example.com");

    const res = await request(app).get(`/api/places/user/${userId}`);

    expect(res.status).toBe(404);
  });
});
