import { supabase } from "./supabase";
import type { Initiative, Post, Milestone, Contact } from "./database.types";

// ============================================================
// 이니셔티브
// ============================================================
export async function getInitiatives(): Promise<Initiative[]> {
  const { data, error } = await supabase
    .from("initiatives")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as Initiative[];
}

export async function getInitiative(slug: string): Promise<Initiative | null> {
  const { data, error } = await supabase
    .from("initiatives")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data as Initiative | null;
}

export async function updateInitiative(
  slug: string,
  updates: Partial<Omit<Initiative, "slug">>
): Promise<void> {
  const { error } = await supabase
    .from("initiatives")
    .update(updates as Record<string, unknown>)
    .eq("slug", slug);
  if (error) throw error;
}

// ============================================================
// 게시글
// ============================================================
export async function getPosts(opts: {
  board: "news" | "diaspora";
  page?: number;
  limit?: number;
  initiativeSlug?: string;
  search?: string;
}): Promise<{ posts: Post[]; total: number }> {
  const { board, page = 1, limit = 10, initiativeSlug, search } = opts;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("board", board)
    .order("published_date", { ascending: false })
    .range(from, to);

  if (initiativeSlug) query = query.eq("initiative_slug", initiativeSlug);
  if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { posts: (data ?? []) as Post[], total: count ?? 0 };
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data as Post | null;
}

export async function getHomePosts(count: number): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("board", "news")
    .order("is_pinned_home", { ascending: false })
    .order("published_date", { ascending: false })
    .limit(count);
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function createPost(
  post: Omit<Post, "id" | "created_at">
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert(post as Record<string, unknown>)
    .select()
    .single();
  if (error) throw error;
  return data as Post;
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "id" | "created_at">>
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update(updates as Record<string, unknown>)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// 연혁
// ============================================================
export async function getMilestones(): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return (data ?? []) as Milestone[];
}

export async function createMilestone(
  m: Omit<Milestone, "id">
): Promise<Milestone> {
  const { data, error } = await supabase
    .from("milestones")
    .insert(m as Record<string, unknown>)
    .select()
    .single();
  if (error) throw error;
  return data as Milestone;
}

export async function updateMilestone(
  id: string,
  updates: Partial<Omit<Milestone, "id">>
): Promise<void> {
  const { error } = await supabase
    .from("milestones")
    .update(updates as Record<string, unknown>)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteMilestone(id: string): Promise<void> {
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// 사이트 설정
// ============================================================
export async function getSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) throw error;
  return Object.fromEntries(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])
  );
}

export async function updateSiteSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value } as Record<string, unknown>);
  if (error) throw error;
}

// ============================================================
// 문의
// ============================================================
export async function submitContact(contact: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase
    .from("contacts")
    .insert(contact as Record<string, unknown>);
  if (error) throw error;
}

export async function getContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Contact[];
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// 이미지 업로드 (Storage + WebP 압축)
// ============================================================
export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const path = `${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, compressed, { contentType: "image/webp", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  const path = url.split("/post-images/")[1];
  if (!path) return;
  await supabase.storage.from("post-images").remove([path]);
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_WIDTH = 1600;
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Image compression failed"));
        },
        "image/webp",
        0.82
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}
