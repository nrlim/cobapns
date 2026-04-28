import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cobapns.com";

  // Landing page sections for sitelinks / better indexing
  const sections = [
    { id: "kenapa-kami", priority: 0.8 },
    { id: "fitur-unggulan", priority: 0.8 },
    { id: "progres-belajar", priority: 0.7 },
    { id: "perjalanan", priority: 0.7 },
    { id: "tentang", priority: 0.6 },
    { id: "testimoni", priority: 0.7 },
    { id: "harga", priority: 0.9 },
    { id: "kontak", priority: 0.5 },
  ];

  const sectionEntries: MetadataRoute.Sitemap = sections.map((s) => ({
    url: `${baseUrl}/#${s.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: s.priority,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...sectionEntries,
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-dan-ketentuan`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
