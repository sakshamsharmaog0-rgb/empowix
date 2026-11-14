// Static ES module imports ensure Vite bundles every asset into dist/assets/
// for production deployments (Vercel, GitHub Pages, etc.) with content hashes.
import heroShowcase from './images/hero_empowix_showcase_1791891293649.jpg';
import audioHeadphones from './images/product_audio_headphones_1791891295143.jpg';
import smartWatch from './images/product_smart_watch_1791891294794.jpg';
import leatherBag from './images/product_leather_bag_1791891294834.jpg';
import minimalSneaker from './images/product_minimal_sneaker_1791891294824.jpg';
import orbitEarbuds from './images/product_orbit_earbuds_1792578738987.jpg';
import smartRing from './images/product_smart_ring_1792578738803.jpg';
import leatherWallet from './images/product_leather_wallet_1792578738742.jpg';
import runnerSneaker from './images/product_runner_sneaker_1792578739378.jpg';
import desktopDac from './images/product_desktop_dac_1792579308926.jpg';
import portableSpeaker from './images/product_portable_speaker_1792579309242.jpg';
import smartGlasses from './images/product_smart_glasses_1792579310797.jpg';
import leatherBriefcase from './images/product_leather_briefcase_1792579310087.jpg';
import deskMat from './images/product_desk_mat_1792579311525.jpg';
import chelseaBoot from './images/product_chelsea_boot_1792579311444.jpg';
import pulseTracker from './images/product_pulse_tracker_1792580063775.jpg';
import leatherLoafer from './images/product_leather_loafer_1792580062980.jpg';

export const ASSET_IMAGES = {
  heroShowcase,
  audioHeadphones,
  smartWatch,
  leatherBag,
  minimalSneaker,
  orbitEarbuds,
  smartRing,
  leatherWallet,
  runnerSneaker,
  desktopDac,
  portableSpeaker,
  smartGlasses,
  leatherBriefcase,
  deskMat,
  chelseaBoot,
  pulseTracker,
  leatherLoafer,
} as const;

export const ASSET_OPTIONS: { label: string; src: string }[] = [
  { label: 'Studio Horizon ANC Headphones', src: audioHeadphones },
  { label: 'Chrono-X Titanium Smart Watch', src: smartWatch },
  { label: 'Atelier Weekender Leather Bag', src: leatherBag },
  { label: 'Monolith Clean Court Sneaker', src: minimalSneaker },
  { label: 'Orbit Studio TWS Earbuds', src: orbitEarbuds },
  { label: 'Apex Biometric Smart Ring', src: smartRing },
  { label: 'Siena Slim Leather Cardholder', src: leatherWallet },
  { label: 'Aero Sprint Suede Runner', src: runnerSneaker },
  { label: 'SoundCore Hi-Fi Desktop DAC', src: desktopDac },
  { label: 'Resonator Portable Speaker', src: portableSpeaker },
  { label: 'Horizon Smart Audio Eyewear', src: smartGlasses },
  { label: 'Veloce Executive Briefcase', src: leatherBriefcase },
  { label: 'Atelier Leather Desk Blotter', src: deskMat },
  { label: 'Terra Italian Chelsea Boot', src: chelseaBoot },
  { label: 'Pulse Recovery Band', src: pulseTracker },
  { label: 'Riviera Penny Loafer', src: leatherLoafer },
];

// Canonical filename stem -> bundled production asset URL.
// Resolves legacy '/src/assets/images/...' paths and stale hashed URLs from saved orders/state.
const ASSET_STEM_MAP: Record<string, string> = {
  hero_empowix_showcase_1791891293649: heroShowcase,
  product_audio_headphones_1791891295143: audioHeadphones,
  product_smart_watch_1791891294794: smartWatch,
  product_leather_bag_1791891294834: leatherBag,
  product_minimal_sneaker_1791891294824: minimalSneaker,
  product_orbit_earbuds_1792578738987: orbitEarbuds,
  product_smart_ring_1792578738803: smartRing,
  product_leather_wallet_1792578738742: leatherWallet,
  product_runner_sneaker_1792578739378: runnerSneaker,
  product_desktop_dac_1792579308926: desktopDac,
  product_portable_speaker_1792579309242: portableSpeaker,
  product_smart_glasses_1792579310797: smartGlasses,
  product_leather_briefcase_1792579310087: leatherBriefcase,
  product_desk_mat_1792579311525: deskMat,
  product_chelsea_boot_1792579311444: chelseaBoot,
  product_pulse_tracker_1792580063775: pulseTracker,
  product_leather_loafer_1792580062980: leatherLoafer,
};

const KNOWN_STEMS = Object.keys(ASSET_STEM_MAP);

/**
 * Resolves any image reference (bundled URL, legacy '/src/assets/images/...' string,
 * stale hashed '/assets/...-<hash>.jpg', or external HTTPS URL) to a valid URL.
 */
export function resolveAssetUrl(src?: string | null): string {
  if (!src || typeof src !== 'string') {
    return smartWatch;
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return smartWatch;
  }

  // Data URIs and external HTTPS/HTTP URLs
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  ) {
    return trimmed;
  }

  // Match against known bundled asset stems (handles both dev paths and stale production hashes)
  const lower = trimmed.toLowerCase();
  for (const stem of KNOWN_STEMS) {
    if (lower.includes(stem)) {
      return ASSET_STEM_MAP[stem];
    }
  }

  return trimmed;
}
