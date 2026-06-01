export async function getRedditSentiment() {
  try {
    const res = await fetch("/api/intel/reddit");

    if (!res.ok) throw new Error("Reddit fetch failed");

    const data = await res.json();

    return data.map((post: any) => ({
      title: post.title,
      score: post.score,
      comments: post.comments,
    }));
  } catch (err) {
    console.error("Reddit error:", err);

    return []; // safe fallback
  }
}