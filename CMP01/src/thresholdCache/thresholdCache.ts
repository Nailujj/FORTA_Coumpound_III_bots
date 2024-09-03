import { LRUCache } from "lru-cache";
import { ethers, BigNumber } from "ethers";

export const amountCache: LRUCache<string, { timestamp: number; amount: BigNumber }> = new LRUCache({
  max: 1000,
});

export const userSupplyTracker: LRUCache<string, { totalSupplySum: BigNumber; supplyCounter: number }> = new LRUCache({
  max: 1000,
});

export const userThresholds = new Map<string, BigNumber>();

export const setThresholdForUser = (userAddress: string, threshold: BigNumber) => {
  userThresholds.set(userAddress, threshold);
};

export const getThresholdForUser = (userAddress: string): BigNumber => {
  return userThresholds.get(userAddress) || ethers.BigNumber.from("10");
};

export const clearCachePeriodically = () => {
  setInterval(() => {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    amountCache.forEach((data, userAddress) => {
      if (data.timestamp <= currentTimeInSeconds - 24 * 60 * 60) {
        amountCache.delete(userAddress);
        userSupplyTracker.delete(userAddress);
        userThresholds.delete(userAddress);
      }
    });
  }, 60 * 60 * 1000);
};

export const amountOverThreshold = async (userAddress: string, amount: BigNumber, increment: number): Promise<number> => {
  const userTracker = userSupplyTracker.get(userAddress) || { totalSupplySum: BigNumber.from("0"), supplyCounter: 0 };
  const threshold = getThresholdForUser(userAddress);

  userTracker.totalSupplySum = userTracker.totalSupplySum.add(amount);
  userTracker.supplyCounter += increment;
  userSupplyTracker.set(userAddress, userTracker);

  const overThreshold = userTracker.totalSupplySum.sub(threshold).toNumber();
  return overThreshold > 0 ? overThreshold : 0;
};

export const setThreshold = (newThreshold: BigNumber) => {
  // No longer needed globally since thresholds are per user
  console.warn("Global threshold is deprecated. Use setThresholdForUser instead.");
};

export const clearCache = () => {
  amountCache.clear();
  userSupplyTracker.clear();
  userThresholds.clear();
};
