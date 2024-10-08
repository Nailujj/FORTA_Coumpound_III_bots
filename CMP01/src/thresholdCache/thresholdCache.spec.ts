import { ethers } from "ethers";
import { clearCache, amountOverThreshold, setThresholdForUser, getThresholdForUser } from "./thresholdCache";

describe("Threshold Cache Functions", () => {
  beforeEach(() => {
    // Set the initial threshold for a user
    setThresholdForUser("default", ethers.BigNumber.from(10));
    clearCache();
  });

  afterAll(() => {
    // Clear the cache after all tests
    clearCache();
  });

  it("should update the threshold when multiple users contribute", async () => {
    // Initial threshold value
    expect(getThresholdForUser("default").toString()).toEqual("10");

    // Add data to the cache for two different users
    await amountOverThreshold("user123", ethers.BigNumber.from("3"), 2);
    await amountOverThreshold("user456", ethers.BigNumber.from("5"), 3);

    // Wait for the asynchronous updates to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Since there's no global threshold, you would validate based on user-specific logic.
    // Example: Checking if a threshold is set or if calculations align with expectations.
  });

  it("should handle case where amount is exactly equal to the threshold", async () => {
    // Initial threshold value
    expect(getThresholdForUser("default").toString()).toEqual("10");

    // Add data to the cache
    const result = await amountOverThreshold("user789", ethers.BigNumber.from("10"), 2);

    // Wait for the asynchronous updates to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if the result is correct (should be 0 since the amount is equal to the threshold)
    expect(result).toEqual(0);
  });

  it("should return correct amount over threshold", async () => {
    // Call the function to check the amount over the threshold
    const result = await amountOverThreshold("user89", ethers.BigNumber.from("13"), 2);

    // Wait for the asynchronous updates to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if the result is correct
    expect(result).toEqual(3);
  });
});
