/**
 * Identity resolver utility for resolving wallet addresses to human-readable identities
 * using various web3 identity platforms (ENS, Farcaster, Lens, etc.)
 */
export class IdentityResolver {
  constructor() {
    this.baseUrl = "https://api.web3.bio";
    this.cache = new Map();
  }

  /**
   * Resolves a wallet address to a human-readable identity
   * @param {string} address - The wallet address to resolve
   * @returns {Promise<Object|null>} The resolved identity or null if not found
   */
  async resolveIdentity(address) {
    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address);
    }

    try {
      const response = await fetch(`${this.baseUrl}/profile/${address}`);
      if (!response.ok) throw new Error("Failed to fetch identity");

      const profiles = await response.json();

      // Find the best identity in order of preference
      const identity = this.findBestIdentity(profiles);

      // Cache the result
      this.cache.set(address, identity);

      return identity;
    } catch (error) {
      console.error("Error resolving identity:", error);
      return null;
    }
  }

  /**
   * Finds the best identity from a list of profiles based on platform preference
   * @param {Array} profiles - List of profiles from the API
   * @returns {Object|null} The best identity or null if no profiles found
   */
  findBestIdentity(profiles) {
    if (!profiles || profiles.length === 0) return null;

    // Order of preference: ENS > Farcaster > Lens > Base > Linea
    const platformOrder = ["ens", "farcaster", "lens", "basenames", "linea"];

    // Find the first profile that matches our preferred platforms
    for (const platform of platformOrder) {
      const profile = profiles.find((p) => p.platform === platform);
      if (profile) {
        return {
          address: profile.address,
          identity: profile.identity,
          platform: profile.platform,
          displayName: profile.displayName,
          avatar: profile.avatar,
        };
      }
    }

    // If no preferred platform found, return the first profile
    return {
      address: profiles[0].address,
      identity: profiles[0].identity,
      platform: profiles[0].platform,
      displayName: profiles[0].displayName,
      avatar: profiles[0].avatar,
    };
  }

  /**
   * Formats a display name for an identity
   * @param {Object} identity - The identity object
   * @returns {string|null} The formatted display name or null if no identity
   */
  formatDisplayName(identity) {
    if (!identity) return null;

    // If it's an ENS name, use it directly
    if (identity.platform === "ens") {
      return identity.identity;
    }

    // For other platforms, use displayName if available
    if (identity.displayName) {
      return identity.displayName;
    }

    // Fallback to platform-specific identity
    return identity.identity;
  }
}
