import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPosts, createPost, updatePost, deletePost, uploadImage, deleteImage } from "@/lib/queries";
import { getInitiatives } from "@/lib/queries";
import type { Post, Initiative } from "@/lib/database.types";

export default function AdminPostsTab() {
  const { toast } = useToast();
  const [board, setBoard] = useState<"news" | "diaspora">("news");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    initiativeSlug: "",
    publishedDate: new Date().toISOString().split("T")[0],
  });

  const { data: postsData } = useQuery({
    queryKey: ["admin_posts", board],
    queryFn: () => getPosts({ board, page: 1, limit: 100 }),
  });

  const { data: initiatives = [] } = useQuery({
    queryKey: ["initiatives"],
    queryFn: getInitiatives,
  });

  const posts = postsData?.posts || [];

  const openCreate = () => {
    setForm({
      title: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      linkUrl: "",
      initiativeSlug: "",
      publishedDate: new Date().toISOString().split("T")[0],
    });
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.image_url || "",
      linkUrl: post.link_url || "",
      initiativeSlug: post.initiative_slug || "",
      publishedDate: new Date(post.published_date).toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "이미지는 5MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast({ title: "이미지 업로드 완료" });
    } catch (err: any) {
      toast({
        title: "업로드 실패",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        board,
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        image_url: form.imageUrl || null,
        link_url: form.linkUrl || null,
        initiative_slug: board === "news" && form.initiativeSlug ? form.initiativeSlug : null,
        is_pinned_home: false,
        published_date: new Date(form.publishedDate).toISOString(),
      };

      if (editing) {
        await updatePost(editing.id, payload);
      } else {
        await createPost(payload as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_posts"] });
      setFormOpen(false);
      toast({ title: editing ? "수정 완료" : "등록 완료" });
    },
    onError: (err: any) => {
      toast({
        title: "오류",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const post = posts.find((p) => p.id === id);
      if (post?.image_url) {
        await deleteImage(post.image_url);
      }
      await deletePost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_posts"] });
      setDeleteTarget(null);
      toast({ title: "삭제 완료" });
    },
    onError: (err: any) => {
      toast({
        title: "오류",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">
          {board === "news" ? "뉴스" : "K-Diaspora"} <Badge variant="secondary">{posts.length}</Badge>
        </h2>
        <div className="flex gap-3">
          <Select value={board} onValueChange={(v: any) => setBoard(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="news">뉴스</SelectItem>
              <SelectItem value="diaspora">K-Diaspora</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white">
            <Plus className="w-4 h-4 mr-2" />새 글
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} className="border border-gray-100">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-cordia-dark truncate">{post.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.published_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => setDeleteTarget(post.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "게시글 수정" : "새 게시글 등록"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>제목 *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목을 입력하세요"
              />
            </div>
            <div>
              <Label>요약 *</Label>
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="간단한 요약"
              />
            </div>
            <div>
              <Label>본문 *</Label>
              <Textarea
                rows={7}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="본문 내용"
              />
            </div>

            <div>
              <Label>이미지</Label>
              {form.imageUrl ? (
                <div className="relative inline-block">
                  <img src={form.imageUrl} alt="preview" className="w-full max-h-48 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-cordia-teal hover:bg-cordia-teal/5 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <span className="text-sm text-gray-500">{uploadingImage ? "업로드 중..." : "클릭하여 이미지 업로드"}</span>
                </label>
              )}
            </div>

            <div>
              <Label>외부 링크</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {board === "news" && (
              <div>
                <Label>이니셔티브 카테고리</Label>
                <Select value={form.initiativeSlug} onValueChange={(v) => setForm({ ...form, initiativeSlug: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택 (선택사항)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">없음</SelectItem>
                    {initiatives.map((init) => (
                      <SelectItem key={init.slug} value={init.slug}>
                        {init.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>발행일자 *</Label>
              <Input
                type="date"
                value={form.publishedDate}
                onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              취소
            </Button>
            <Button
              className="bg-cordia-teal hover:bg-cordia-green text-white"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.title || !form.excerpt || !form.content || !form.publishedDate}
            >
              {saveMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
