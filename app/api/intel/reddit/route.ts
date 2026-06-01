export async function GET() {
  try {
    const res = await fetch(
      "https://www.reddit.com/r/cryptocurrency/top.json?limit=20",
      {
        headers: {
          "User-Agent": "crypto-mvp/1.0",
        },
      }
    );

    const data = await res.json();

    const posts = data?.data?.children ?? [];

    return Response.json(
      posts.map((p: any) => ({
        title: p.data.title,
        score: p.data.score,
        comments: p.data.num_comments,
      }))
    );
  } catch (err) {
    return Response.json([]);
  }
}