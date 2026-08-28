import type { ClusteredEvent, RelatedAsset, AssetType, RelatedAssetContext } from '@/types';

export function preloadDatacenterIndex(): Promise<void> {
  return Promise.resolve();
}

export function preloadNuclearFacilities(): Promise<void> {
  return Promise.resolve();
}

export function preloadUnderseaCables(): Promise<void> {
  return Promise.resolve();
}

export function findRelatedAssets(
  _title: string,
  _description?: string,
  _eventLat?: number,
  _eventLon?: number,
  _context?: RelatedAssetContext
): RelatedAsset[] {
  return [];
}

export function getAssetTypeLabel(type: AssetType): string {
  return type;
}
