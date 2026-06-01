export async function getNews() {
  const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss");

  const data = await res.json();

  return data.items.map((item: any) => ({
    title: item.title,
    link: item.link,
    date: item.pubDate,
  }));
}