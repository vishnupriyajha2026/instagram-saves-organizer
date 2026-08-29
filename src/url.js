const SUPPORTED_TYPES = new Set(["p", "reel", "tv"]);

export function normalizeInstagramUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("An Instagram post or reel URL is required.");
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "instagram.com") {
    throw new Error(`Only Instagram URLs are supported: ${value}`);
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const [type, shortcode] = parts;
  if (!SUPPORTED_TYPES.has(type) || !shortcode) {
    throw new Error(`Not a supported Instagram post or reel URL: ${value}`);
  }

  return {
    id: `${type}:${shortcode}`,
    type: type === "p" ? "post" : type,
    shortcode,
    url: `https://www.instagram.com/${type}/${shortcode}/`
  };
}

export function findInstagramUrls(value) {
  if (typeof value !== "string") return [];
  const matches = value.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^\s,\]})"']+/gi) || [];
  return matches.map((url) => url.replace(/[.;!?]+$/, ""));
}
