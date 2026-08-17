import { test, expect } from "@playwright/test";
import path from "path";

const timestamp = Date.now();
const testEmail = `e2e-test-${timestamp}@example.com`;
const testPassword = "password123";
const fixtureImage = path.join(__dirname, "../fixtures/test-image.png");

test("a user can sign up, create a place, and see it in their feed", async ({ page }) => {
  // Real network calls (Cloudinary uploads, geocoding) are slower than the
  // mocked instant responses used everywhere else in this project's test
  // suite — give the whole flow more room than Playwright's 30s default.
  test.setTimeout(90000);

  await page.goto("/auth");

  // Switch to signup mode
  await page.getByRole("button", { name: /create new account/i }).click();

  await page.getByPlaceholder(/first name/i).fill("E2E");
  await page.getByPlaceholder(/last name/i).fill("Tester");
  await page.locator("#birthday").fill("1995-05-20");
  await page.locator("#gender").selectOption("female");
  await page.setInputFiles("#image", fixtureImage);
  await page.getByPlaceholder(/mobile number or email/i).fill(testEmail);
  await page.getByPlaceholder(/^password$/i).fill(testPassword);

  await page.getByRole("button", { name: /^sign up$/i }).click();

  // Auth.tsx navigates to /places on successful signup
  await expect(page).toHaveURL(/\/places$/, { timeout: 30000 });

  // Create a new place via the persistent "Add Place" nav link — always
  // present for a logged-in user regardless of whether the feed is empty,
  // unlike PlaceList's empty-state prompt which only shows sometimes.
  await page.getByRole("link", { name: /add place/i }).click();
  await expect(page).toHaveURL(/\/places\/new$/, { timeout: 15000 });

  const placeTitle = `E2E Test Place ${timestamp}`;
  await page.getByPlaceholder(/what.s the name of the place/i).fill(placeTitle);
  await page.locator("#description").fill("Created by an automated end-to-end test.");
  // A real, geocodable address — this hits the real Nominatim API, unlike
  // the mocked geocoding in the component/integration tests.
  await page
    .getByPlaceholder(/^address$/i)
    .fill("1600 Amphitheatre Parkway, Mountain View, CA");
  await page.setInputFiles("#image", fixtureImage);

  await page.getByRole("button", { name: /^post$/i }).click();

  // NewPlace.tsx navigates to /:userId/places on success, where the new
  // place should now be visible in the feed.
  await expect(page.getByText(placeTitle)).toBeVisible({ timeout: 30000 });
});
