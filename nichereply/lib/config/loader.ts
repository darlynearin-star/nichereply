import { validateNicheConfig, type NicheConfig } from './validator';

const configCache = new Map<string, NicheConfig>();

export function loadNicheConfig(niche: string): NicheConfig {
  const cached = configCache.get(niche);
  if (cached) return cached;

  let data: unknown;

  try {
    data = require(`@/configs/${niche}.json`);
  } catch {
    throw new Error(`Niche config not found: ${niche}. Ensure configs/${niche}.json exists.`);
  }

  const config = validateNicheConfig(data);
  configCache.set(niche, config);
  return config;
}

export function getAvailableNiches(): string[] {
  return ['salons', 'clinics', 'real-estate'];
}

export function clearConfigCache(): void {
  configCache.clear();
}
