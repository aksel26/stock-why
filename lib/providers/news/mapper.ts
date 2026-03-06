import type { NewsData } from "../../domain/schema";

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").trim();
}

export function mapNaverNews(items: NaverNewsItem[]): NewsData {
  const headlines = items
    .map((item) => ({
      title: stripHtmlTags(item.title),
      url: item.originallink || item.link,
    }))
    .filter((item) => item.title.length > 0);

  return { headlines };
}
