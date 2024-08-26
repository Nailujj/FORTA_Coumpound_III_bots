import { LRUCache } from "lru-cache";
import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";

export let THRESHOLD: BigNumber = ethers.BigNumber.from("10");

export const amountCache: LRUCache<string, { timestamp: number; amount: BigNumber }> = new LRUCache({
  max: 1000,
});

export const userSupplyTracker: LRUCache<string, { totalSupplySum: BigNumber; supplyCounter: number }> = new LRUCache({
  max: 1000,
});

export const amountOverThreshold = async (
  userAddress: string,
  amount: BigNumber,
  timestamp: number
): Promise<number> => {
  const bigAmount = BigNumber.from(amount);
  const oldThreshold = THRESHOLD;

  if (!userSupplyTracker.has(userAddress)) {
    userSupplyTracker.set(userAddress, {
      totalSupplySum: BigNumber.from("0"),
      supplyCounter: 0,
    });
  }

  const userTracker = userSupplyTracker.get(userAddress) || { totalSupplySum: BigNumber.from("0"), supplyCounter: 0 };

  if (amountCache.has(userAddress)) {
    const cachedData = amountCache.get(userAddress) || { timestamp: 0, amount: BigNumber.from("0") };

    if (timestamp - cachedData.timestamp <= 24 * 60 * 60) {
      const totalAmountWithinDay = cachedData.amount.add(bigAmount);

      amountCache.set(userAddress, {
        timestamp: timestamp,
        amount: totalAmountWithinDay,
      });

      // Update der nutzerspezifischen Zähler
      userTracker.totalSupplySum = userTracker.totalSupplySum.add(bigAmount);
      userTracker.supplyCounter++;

      userSupplyTracker.set(userAddress, userTracker);

      // Schwellenwert für diesen Nutzer berechnen
      const average = userTracker.totalSupplySum.div(userTracker.supplyCounter);
      THRESHOLD = average.add(average.mul(20).div(100));

      if (totalAmountWithinDay.gt(oldThreshold)) {
        amountCache.set(userAddress, { timestamp: timestamp, amount: BigNumber.from("0") });
        return totalAmountWithinDay.sub(oldThreshold).toNumber();
      }
    }
  } else {
    amountCache.set(userAddress, {
      timestamp: timestamp,
      amount: bigAmount,
    });

    userTracker.totalSupplySum = userTracker.totalSupplySum.add(bigAmount);
    userTracker.supplyCounter++;

    userSupplyTracker.set(userAddress, userTracker);

    const average = userTracker.totalSupplySum.div(userTracker.supplyCounter);
    THRESHOLD = average.add(average.mul(20).div(100));

    if (bigAmount.gt(oldThreshold)) {
      amountCache.set(userAddress, { timestamp: timestamp, amount: BigNumber.from("0") });
      return bigAmount.sub(oldThreshold).toNumber();
    }
  }

  return 0;
};

// Funktion zum Leeren des Caches
export const clearCache = () => {
  amountCache.clear();
  userSupplyTracker.clear();
};

// Funktion zum periodischen Leeren des Caches für jeden Nutzer
export const clearCachePeriodically = () => {
  setInterval(() => {
    const currentTime = Date.now();

    amountCache.forEach((data, userAddress) => {
      if (data.timestamp >= currentTime - 24 * 60 * 60 * 1000) {
        amountCache.delete(userAddress);
        userSupplyTracker.delete(userAddress);
      }
    });
  }, 60 * 60 * 1000);
};

export const setThreshold = (newThreshold: any): void => {
  THRESHOLD = newThreshold;
};
