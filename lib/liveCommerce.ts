import { db } from "./db";

export type LiveStream = {
  id: string;
  title: string;
  stream_url?: string;
  status: "idle" | "live" | "ended";
  featured_product_id?: string;
  current_viewers: number;
};

export async function getActiveLiveStream(): Promise<LiveStream | null> {
  try {
    const stream = await db.liveStream.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (stream) {
      return {
        id: stream.id,
        title: stream.title,
        stream_url: stream.streamUrl ?? undefined,
        status: stream.status as LiveStream["status"],
        featured_product_id: stream.featuredProductId ?? undefined,
        current_viewers: stream.currentViewers,
      };
    }
  } catch (error) {
    console.error("Failed to fetch live stream:", error);
  }

  // Fallback for demo
  return {
    id: "demo-live",
    title: "Live Grand Opening - คืนกำไรลูกค้า!",
    status: "live",
    current_viewers: 1240,
    featured_product_id: undefined,
  };
}

export async function updateLiveStream(id: string, updates: Partial<LiveStream>) {
  try {
    await db.liveStream.update({
      where: { id },
      data: {
        title: updates.title,
        streamUrl: updates.stream_url,
        status: updates.status,
        featuredProductId: updates.featured_product_id,
        currentViewers: updates.current_viewers,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to update live stream:", error);
    return { success: false, error };
  }
}
