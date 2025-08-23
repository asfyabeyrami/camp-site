import fs from "fs";
import path from "path";
import { create } from "xmlbuilder2";
// اگر node نسخه >=18 داری:
const fetch = globalThis.fetch ?? (await import("node-fetch")).default;
const siteUrl = "https://pooladmotor.com";
const outDir = path.join(process.cwd(), "public");
const PAGE_SIZE = 200;

function chunkArray(array, size) {
  const results = [];
  for (let i = 0; i < array.length; i += size) {
    results.push(array.slice(i, i + size));
  }
  return results;
}

const cleanLoc = (str) =>
  str.startsWith("/") ? siteUrl + str : siteUrl + "/" + str;

function buildSitemap(urls) {
  const root = create({ version: "1.0" }).ele("urlset", {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
  });
  for (const urlItem of urls) {
    const url = root.ele("url");
    url.ele("loc").txt(cleanLoc(urlItem.loc));
    if (urlItem.lastmod) url.ele("lastmod").txt(urlItem.lastmod);
    if (urlItem.priority) url.ele("priority").txt(urlItem.priority);
    if (urlItem.changefreq) url.ele("changefreq").txt(urlItem.changefreq);
  }
  return root.end({ prettyPrint: true });
}

function buildSitemapIndex(sitemaps) {
  const root = create({ version: "1.0" }).ele("sitemapindex", {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
  });

  sitemaps.forEach((loc) => {
    root
      .ele("sitemap")
      .ele("loc")
      .txt(cleanLoc(loc))
      .up()
      .ele("lastmod")
      .txt(new Date().toISOString());
  });

  return root.end({ prettyPrint: true });
}

(async function main() {
  try {
    // محصولات
    const productsRes = await fetch(
      "https://api.pooladmotor.com/product/sort?take=5000"
    );
    if (!productsRes.ok) throw new Error("Failed to fetch products");
    const productsData = await productsRes.json();
    let products = [];
    if (productsData?.data?.length) {
      products = productsData.data.map((product) => ({
        loc: `/${encodeURIComponent(product.slug)}`,
        lastmod: new Date(product.updatedAt || Date.now()).toISOString(),
        priority: 0.7,
        changefreq: "daily",
      }));
    }

    // دسته‌بندی‌ها
    const categoriesRes = await fetch("https://api.pooladmotor.com/category");
    if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
    const categoriesData = await categoriesRes.json();
    const allCategories = flattenCategories(categoriesData.data);
    let categories = [];
    if (allCategories.length) {
      categories = allCategories.map((category) => ({
        loc: `/${encodeURIComponent(category.slug)}`,
        lastmod: new Date(category.updatedAt || Date.now()).toISOString(),
        priority: 0.8,
        changefreq: "weekly",
      }));
    }

    // تگ‌ها
    const tagsRes = await fetch("https://api.pooladmotor.com/tag");
    if (!tagsRes.ok) throw new Error("Failed to fetch tags");
    const tagsData = await tagsRes.json();
    let tags = [];
    if (tagsData?.data?.length) {
      tags = tagsData.data.map((tag) => ({
        loc: `/tag/${encodeURIComponent(tag.slug)}`,
        lastmod: new Date(tag.updatedAt || Date.now()).toISOString(),
        priority: 0.5,
        changefreq: "monthly",
      }));
    }

    // ساخت فایل‌های مختلف سایت‌مپ
    const sitemapList = [];

    // محصولات
    const productChunks = chunkArray(products, PAGE_SIZE);
    productChunks.forEach((chunk, idx) => {
      const filename = `sitemap-products-${idx + 1}.xml`;
      fs.writeFileSync(
        path.join(outDir, filename),
        buildSitemap(chunk),
        "utf8"
      );
      sitemapList.push(filename);
    });

    // دسته‌بندی‌ها
    const categoryChunks = chunkArray(categories, PAGE_SIZE);
    categoryChunks.forEach((chunk, idx) => {
      const filename = `sitemap-categories-${idx + 1}.xml`;
      fs.writeFileSync(
        path.join(outDir, filename),
        buildSitemap(chunk),
        "utf8"
      );
      sitemapList.push(filename);
    });

    // تگ‌ها
    const tagChunks = chunkArray(tags, PAGE_SIZE);
    tagChunks.forEach((chunk, idx) => {
      const filename = `sitemap-tags-${idx + 1}.xml`;
      fs.writeFileSync(
        path.join(outDir, filename),
        buildSitemap(chunk),
        "utf8"
      );
      sitemapList.push(filename);
    });

    // Sitemap index
    fs.writeFileSync(
      path.join(outDir, "sitemap.xml"),
      buildSitemapIndex(sitemapList),
      "utf8"
    );
    console.log("✅ همه سایت‌مپ‌ها با موفقیت ساخته شدند!");

    // robots.txt
    const robotsTxt = `
User-agent: *
Allow: /
Disallow: /auth
Disallow: /orders
Disallow: /complete-info
Disallow: /cart
Disallow: /checkout
Disallow: /profile
Disallow: /api/
Sitemap: ${siteUrl}/sitemap.xml
`.trim();

    fs.writeFileSync(path.join(outDir, "robots.txt"), robotsTxt, "utf8");
    console.log("✅ فایل robots.txt ساخته شد!");
  } catch (err) {
    console.error("❌ خطا در ساخت سایت‌مپ:", err);
    process.exit(1);
  }
})();
function flattenCategories(categories) {
  let res = [];
  for (const cat of categories) {
    res.push(cat);
    if (Array.isArray(cat.children) && cat.children.length) {
      res = res.concat(flattenCategories(cat.children));
    }
  }
  return res;
}
