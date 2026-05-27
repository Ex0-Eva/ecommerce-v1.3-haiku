import { db } from "./db";

export type SiteConfig = {
  id?: string;
  store_name?: string;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  border_radius: string;
  logo_url?: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  promptpay_number?: string;
  qr_code_url?: string;
  faq_content?: string;
  shipping_content?: string;
  contact_content?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  line_url?: string;
};

export const defaultSettings: SiteConfig = {
  store_name: "Next E-commerce",
  theme_name: "modern",
  primary_color: "#0f172a",
  secondary_color: "#64748b",
  font_family: "Inter, sans-serif",
  border_radius: "1.5rem",
  bank_name: "",
  account_name: "",
  account_number: "",
  promptpay_number: "",
  qr_code_url: "",
  faq_content: "ยังไม่มีข้อมูล FAQ",
  shipping_content: "ยังไม่มีข้อมูลนโยบายการจัดส่ง",
  contact_content: "ยังไม่มีข้อมูลติดต่อเรา",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  line_url: "",
};

function mapConfig(row: any): SiteConfig {
  return {
    id: row.id,
    store_name: row.storeName,
    theme_name: row.themeName,
    primary_color: row.primaryColor,
    secondary_color: row.secondaryColor,
    font_family: row.fontFamily,
    border_radius: row.borderRadius,
    logo_url: row.logoUrl ?? undefined,
    bank_name: row.bankName ?? undefined,
    account_name: row.accountName ?? undefined,
    account_number: row.accountNumber ?? undefined,
    promptpay_number: row.promptpayNumber ?? undefined,
    qr_code_url: row.qrCodeUrl ?? undefined,
    faq_content: row.faqContent,
    shipping_content: row.shippingContent,
    contact_content: row.contactContent,
    facebook_url: row.facebookUrl ?? undefined,
    twitter_url: row.twitterUrl ?? undefined,
    instagram_url: row.instagramUrl ?? undefined,
    line_url: row.lineUrl ?? undefined,
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const row = await db.siteConfig.findFirst();
    if (row) return mapConfig(row);
  } catch (err) {
    console.error("Failed to fetch site config, using defaults:", err);
  }
  return defaultSettings;
}

export async function updateSiteConfig(config: Partial<SiteConfig>) {
  try {
    const existing = await db.siteConfig.findFirst({ select: { id: true } });

    const data = {
      storeName: config.store_name,
      themeName: config.theme_name,
      primaryColor: config.primary_color,
      secondaryColor: config.secondary_color,
      fontFamily: config.font_family,
      borderRadius: config.border_radius,
      logoUrl: config.logo_url,
      bankName: config.bank_name,
      accountName: config.account_name,
      accountNumber: config.account_number,
      promptpayNumber: config.promptpay_number,
      qrCodeUrl: config.qr_code_url,
      faqContent: config.faq_content,
      shippingContent: config.shipping_content,
      contactContent: config.contact_content,
      facebookUrl: config.facebook_url,
      twitterUrl: config.twitter_url,
      instagramUrl: config.instagram_url,
      lineUrl: config.line_url,
    };

    // Remove undefined keys so Prisma doesn't overwrite with null
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    if (!existing) {
      await db.siteConfig.create({ data: cleanData as any });
    } else {
      await db.siteConfig.update({ where: { id: existing.id }, data: cleanData });
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to update site config:", err);
    return { success: false, error: err };
  }
}
