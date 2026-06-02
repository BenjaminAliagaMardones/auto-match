import { useMemo } from 'react';

export const AD_INTERVAL = 5;
export const MIN_VEHICLES_BEFORE_FIRST_AD = 3;

const DEFAULT_CONFIG = {
  adInterval: AD_INTERVAL,
  minVehiclesBeforeFirstAd: MIN_VEHICLES_BEFORE_FIRST_AD,
};

const createVehicleItem = (vehicle) => ({
  type: 'vehicle',
  id: `vehicle-${vehicle.id}`,
  vehicle,
});

const createAdItem = (ad, vehicleCount, adIndex) => ({
  type: 'ad',
  id: `feed-ad-after-${vehicleCount}-${ad.id}-${adIndex}`,
  ad,
  placement: 'feed',
  vehicleCount,
});

export function buildFeedItems(vehicles, ads, config = {}) {
  const { adInterval, minVehiclesBeforeFirstAd } = { ...DEFAULT_CONFIG, ...config };

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return [];
  }

  const feedItems = [];
  const availableAds = Array.isArray(ads) ? ads : [];
  let insertedAdCount = 0;

  vehicles.forEach((vehicle, index) => {
    const vehicleCount = index + 1;
    feedItems.push(createVehicleItem(vehicle));

    const shouldInsertAd =
      availableAds.length > 0 &&
      adInterval > 0 &&
      vehicleCount >= minVehiclesBeforeFirstAd &&
      vehicleCount % adInterval === 0 &&
      feedItems.at(-1)?.type !== 'ad';

    if (shouldInsertAd) {
      const ad = availableAds[insertedAdCount % availableAds.length];
      feedItems.push(createAdItem(ad, vehicleCount, insertedAdCount));
      insertedAdCount += 1;
    }
  });

  return feedItems.filter((item, index, items) => {
    return item.type !== 'ad' || items[index - 1]?.type !== 'ad';
  });
}

export function useAdInsertion(vehicles, ads, config) {
  return useMemo(() => buildFeedItems(vehicles, ads, config), [ads, config, vehicles]);
}
