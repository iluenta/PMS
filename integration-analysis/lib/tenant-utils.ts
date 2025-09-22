import type { Tenant } from "@/types/guide"

export function getTenantFromDomain(domain: string): string | null {
  // Extract tenant slug from subdomain
  // e.g., "vera-properties.yourdomain.com" -> "vera-properties"
  const parts = domain.split(".")
  if (parts.length > 2) {
    return parts[0]
  }
  return null
}

export function getTenantFromPath(pathname: string): string | null {
  // Extract tenant slug from URL path
  // e.g., "/vera-properties/property/123/guide" -> "vera-properties"
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length > 0) {
    return parts[0]
  }
  return null
}

export function buildTenantUrl(tenant: Tenant, path = ""): string {
  if (tenant.domain) {
    return `https://${tenant.domain}${path}`
  }
  return `/${tenant.slug}${path}`
}

export function validateTenantSlug(slug: string): boolean {
  // Validate tenant slug format (lowercase, alphanumeric, hyphens)
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
}

export function generateTenantSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}
