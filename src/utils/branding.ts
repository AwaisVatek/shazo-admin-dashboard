/**
 * TODO: Replace localStorage branding with GET/POST /api/admin/settings/branding once backend storage is added.
 */

export type BrandingType = 'horizontal' | 'square' | 'icon' | 'sidebar' | 'login' | 'favicon';

const BRAND_KEYS: Record<BrandingType, string> = {
  horizontal: "shazo_brand_horizontal_logo",
  square: "shazo_brand_square_logo",
  icon: "shazo_brand_icon_logo",
  sidebar: "shazo_brand_sidebar_logo",
  login: "shazo_brand_login_logo",
  favicon: "shazo_brand_favicon_logo"
};

export function getBrandLogo(type: BrandingType): string | null {
  return localStorage.getItem(BRAND_KEYS[type]);
}

export function setBrandLogo(type: BrandingType, dataUrl: string): void {
  localStorage.setItem(BRAND_KEYS[type], dataUrl);
  if (type === 'favicon') {
    updateFaviconElement(dataUrl);
  }
}

export function removeBrandLogo(type: BrandingType): void {
  localStorage.removeItem(BRAND_KEYS[type]);
  if (type === 'favicon') {
    updateFaviconElement('/favicon.ico');
  }
}

export function validateLogoFile(file: File): string | null {
  if (file.type !== 'image/png') {
    return 'Invalid file format. Only PNG images are accepted.';
  }
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return 'Max file size exceeded. Image must be smaller than 2MB.';
  }
  return null;
}

export function updateFaviconElement(href: string): void {
  try {
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = href;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = href;
      document.head.appendChild(newLink);
    }
  } catch (err) {
    console.warn('Failed to update favicon element:', err);
  }
}
