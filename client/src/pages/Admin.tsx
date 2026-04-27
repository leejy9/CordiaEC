import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Pencil, Trash2, Lock, Calendar, ExternalLink, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle, Initiative, OverseasKoreanPost } from "@shared/schema";

const ADMIN_PASSWORD = "cordia2025";

const INITIATIVE_TYPES = [
  { slug: "k-food", label: "K-Food", category: "Food & Beverage" },
  { slug: "k-beauty", label: "K-Beauty", category: "Beauty & Cosmetics" },
  { slug: "startups", label: "Startups", category: "Technology & Innovation" },
  { slug: "vc-matching", label: "VC Matching", category: "Investment & Finance" },
  { slug: "internships", label: "Internships", category: "Education & Development" },
  { slug: "forums", label: "Knowledge Forums", category: "Knowledge & Collaboration" },
];

// ---- Shared Image Upload Component ----
function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label>이미지 (선택)</Label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="w-full max-h-48 object-cover rounded-lg border" />
          <button
            type="button"
            onClick={() => { onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-cordia-teal hover:bg-cordia-teal/5 transition-colors cursor-pointer"
        >
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-500">클릭하여 이미지 업로드</span>
          <span className="text-xs text-gray-400">JPG, PNG, GIF · 최대 5MB</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ---- Shared Form Fields (used by all 3 boards) ----
interface CommonForm {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  publishedDate: string;
}

function CommonFields({
  form,
  setForm,
}: {
  form: CommonForm;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}) {
  return (
    <>
      <div>
        <Label>제목 *</Label>
        <Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="제목을 입력하세요" />
      </div>
      <div>
        <Label>요약 *</Label>
        <Textarea rows={2} value={form.excerpt} onChange={e => setForm((f: any) => ({ ...f, excerpt: e.target.value }))} placeholder="간단한 요약 (목록 화면에 표시)" />
      </div>
      <div>
        <Label>본문 *</Label>
        <Textarea rows={7} value={form.content} onChange={e => setForm((f: any) => ({ ...f, content: e.target.value }))} placeholder="본문 내용" />
      </div>
      <ImageUpload value={form.imageUrl} onChange={val => setForm((f: any) => ({ ...f, imageUrl: val }))} />
      <div>
        <Label>외부 링크 (선택)</Label>
        <Input value={form.linkUrl} onChange={e => setForm((f: any) => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." />
      </div>
      <div>
        <Label>발행일자 *</Label>
        <Input type="date" value={form.publishedDate} onChange={e => setForm((f: any) => ({ ...f, publishedDate: e.target.value }))} />
      </div>
    </>
  );
}

function isCommonFormValid(form: CommonForm) {
  return !!(form.title && form.excerpt && form.content && form.publishedDate);
}

// ---- Login Gate ----
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-cordia-teal/10 rounded-full p-4">
                <Lock className="w-8 h-8 text-cordia-teal" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-cordia-dark">Admin Access</CardTitle>
            <p className="text-gray-500 text-sm mt-1">관리자 비밀번호를 입력하세요</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false); }}
                  placeholder="비밀번호 입력"
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-red-500 text-sm mt-1">비밀번호가 틀렸습니다.</p>}
              </div>
              <Button type="submit" className="w-full bg-cordia-teal hover:bg-cordia-green text-white">로그인</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// ---- News Tab ----
function NewsTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const defaultForm: CommonForm = { title: "", excerpt: "", content: "", imageUrl: "", linkUrl: "", publishedDate: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState<CommonForm>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/news", 1, 100],
    queryFn: async () => (await fetch("/api/news?page=1&limit=100")).json(),
  });
  const articles: NewsArticle[] = data?.articles || [];

  const openCreate = () => { setForm(defaultForm); setEditing(null); setFormOpen(true); };
  const openEdit = (a: NewsArticle) => {
    setEditing(a);
    setForm({
      title: a.title, excerpt: a.excerpt, content: a.content,
      imageUrl: a.imageUrl || "", linkUrl: (a as any).linkUrl || "",
      publishedDate: new Date(a.publishedDate).toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title, excerpt: form.excerpt, content: form.content,
        imageUrl: form.imageUrl || null, linkUrl: form.linkUrl || null,
        publishedDate: new Date(form.publishedDate).toISOString(),
      };
      const url = editing ? `/api/news/${editing.id}` : "/api/news";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/news"] }); setFormOpen(false); toast({ title: editing ? "수정 완료" : "등록 완료" }); },
    onError: () => toast({ title: "오류", description: "저장에 실패했습니다.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const res = await fetch(`/api/news/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/news"] }); setDeleteTarget(null); toast({ title: "삭제 완료" }); },
    onError: () => toast({ title: "오류", description: "삭제에 실패했습니다.", variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">뉴스 <Badge variant="secondary">{articles.length}</Badge></h2>
        <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white"><Plus className="w-4 h-4 mr-2" />새 글</Button>
      </div>
      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        : articles.length === 0 ? <div className="text-center py-16 text-gray-400">아직 게시글이 없습니다.</div>
        : (
          <div className="space-y-3">
            {articles.map(a => (
              <Card key={a.id} className="border border-gray-100">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {a.imageUrl && <img src={a.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-cordia-dark truncate">{a.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Calendar className="w-3 h-3" />{new Date(a.publishedDate).toLocaleDateString()}
                        {(a as any).linkUrl && <span className="flex items-center gap-1 text-cordia-teal"><ExternalLink className="w-3 h-3" />링크 있음</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(a.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "뉴스 수정" : "새 뉴스 등록"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <CommonFields form={form} setForm={setForm} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>취소</Button>
            <Button className="bg-cordia-teal hover:bg-cordia-green text-white" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isCommonFormValid(form)}>
              {saveMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Initiatives Tab ----
interface InitForm extends CommonForm {
  selectedType: string;
}

function InitiativesTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const defaultForm: InitForm = { selectedType: "", title: "", excerpt: "", content: "", imageUrl: "", linkUrl: "", publishedDate: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState<InitForm>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/initiatives"],
    queryFn: async () => (await fetch("/api/initiatives")).json(),
  });
  const items: Initiative[] = data?.initiatives || [];

  const openCreate = () => { setForm(defaultForm); setEditing(null); setFormOpen(true); };
  const openEdit = (item: Initiative) => {
    setEditing(item);
    const typeMatch = INITIATIVE_TYPES.find(t => t.slug === item.slug);
    setForm({
      selectedType: typeMatch?.slug || "",
      title: item.title,
      excerpt: item.description,
      content: item.content,
      imageUrl: item.imageUrl || "",
      linkUrl: (item as any).linkUrl || "",
      publishedDate: item.publishedDate ? new Date(item.publishedDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const selectedTypeInfo = INITIATIVE_TYPES.find(t => t.slug === form.selectedType);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTypeInfo) throw new Error("type required");
      const payload = {
        slug: selectedTypeInfo.slug,
        category: selectedTypeInfo.category,
        title: form.title,
        description: form.excerpt,
        content: form.content,
        imageUrl: form.imageUrl || null,
        linkUrl: form.linkUrl || null,
        publishedDate: form.publishedDate ? new Date(form.publishedDate).toISOString() : null,
      };
      const url = editing ? `/api/initiatives/${editing.id}` : "/api/initiatives";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] }); setFormOpen(false); toast({ title: editing ? "수정 완료" : "등록 완료" }); },
    onError: () => toast({ title: "오류", description: "저장에 실패했습니다.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const res = await fetch(`/api/initiatives/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] }); setDeleteTarget(null); toast({ title: "삭제 완료" }); },
    onError: () => toast({ title: "오류", description: "삭제에 실패했습니다.", variant: "destructive" }),
  });

  const isValid = !!(form.selectedType && form.title && form.excerpt && form.content && form.publishedDate);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">이니셔티브 <Badge variant="secondary">{items.length}</Badge></h2>
        <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white"><Plus className="w-4 h-4 mr-2" />새 글</Button>
      </div>
      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        : items.length === 0 ? <div className="text-center py-16 text-gray-400">아직 이니셔티브가 없습니다.</div>
        : (
          <div className="space-y-3">
            {items.map(item => {
              const typeInfo = INITIATIVE_TYPES.find(t => t.slug === item.slug);
              return (
                <Card key={item.id} className="border border-gray-100">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-cordia-dark truncate">{item.title}</p>
                          <Badge variant="outline" className="text-xs shrink-0">{typeInfo?.label || item.category}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "이니셔티브 수정" : "새 이니셔티브 등록"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Initiative Type Toggle */}
            <div>
              <Label>이니셔티브 유형 * <span className="text-xs text-gray-400">(하나 선택)</span></Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INITIATIVE_TYPES.map(type => (
                  <button
                    key={type.slug}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, selectedType: type.slug }))}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      form.selectedType === type.slug
                        ? "bg-cordia-teal text-white border-cordia-teal shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-cordia-teal hover:text-cordia-teal"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {form.selectedType && (
                <p className="text-xs text-gray-400 mt-1">카테고리: {selectedTypeInfo?.category}</p>
              )}
            </div>
            <CommonFields form={form} setForm={setForm} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>취소</Button>
            <Button className="bg-cordia-teal hover:bg-cordia-green text-white" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isValid}>
              {saveMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- K-Diaspora Tab ----
function OverseasKoreanTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OverseasKoreanPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const defaultForm: CommonForm = { title: "", excerpt: "", content: "", imageUrl: "", linkUrl: "", publishedDate: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState<CommonForm>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/overseas-korean", 1, 100],
    queryFn: async () => (await fetch("/api/overseas-korean?page=1&limit=100")).json(),
  });
  const posts: OverseasKoreanPost[] = data?.posts || [];

  const openCreate = () => { setForm(defaultForm); setEditing(null); setFormOpen(true); };
  const openEdit = (p: OverseasKoreanPost) => {
    setEditing(p);
    setForm({
      title: p.title, excerpt: p.excerpt, content: p.content,
      imageUrl: p.imageUrl || "", linkUrl: p.linkUrl || "",
      publishedDate: new Date(p.publishedDate).toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title, excerpt: form.excerpt, content: form.content,
        imageUrl: form.imageUrl || null, linkUrl: form.linkUrl || null,
        publishedDate: new Date(form.publishedDate).toISOString(),
      };
      const url = editing ? `/api/overseas-korean/${editing.id}` : "/api/overseas-korean";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/overseas-korean"] }); setFormOpen(false); toast({ title: editing ? "수정 완료" : "등록 완료" }); },
    onError: () => toast({ title: "오류", description: "저장에 실패했습니다.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const res = await fetch(`/api/overseas-korean/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/overseas-korean"] }); setDeleteTarget(null); toast({ title: "삭제 완료" }); },
    onError: () => toast({ title: "오류", description: "삭제에 실패했습니다.", variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">K-Diaspora <Badge variant="secondary">{posts.length}</Badge></h2>
        <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white"><Plus className="w-4 h-4 mr-2" />새 글</Button>
      </div>
      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        : posts.length === 0 ? <div className="text-center py-16 text-gray-400">아직 게시글이 없습니다.</div>
        : (
          <div className="space-y-3">
            {posts.map(p => (
              <Card key={p.id} className="border border-gray-100">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-cordia-dark truncate">{p.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Calendar className="w-3 h-3" />{new Date(p.publishedDate).toLocaleDateString()}
                        {p.linkUrl && <span className="flex items-center gap-1 text-cordia-teal"><ExternalLink className="w-3 h-3" />링크 있음</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(p.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "게시글 수정" : "새 게시글 등록"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <CommonFields form={form} setForm={setForm} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>취소</Button>
            <Button className="bg-cordia-teal hover:bg-cordia-green text-white" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isCommonFormValid(form)}>
              {saveMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle><AlertDialogDescription>이 작업은 되돌릴 수 없습니다.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Main Admin Page ----
export default function Admin() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "true"
  );

  if (!authenticated) return <LoginGate onLogin={() => setAuthenticated(true)} />;

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-[80vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cordia-dark">관리자 패널</h1>
              <p className="text-gray-500 mt-1">모든 게시판 콘텐츠를 관리하세요</p>
            </div>
            <Button variant="outline" onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthenticated(false); }}>
              <Lock className="w-4 h-4 mr-2" />로그아웃
            </Button>
          </div>

          <Tabs defaultValue="news">
            <TabsList className="mb-6">
              <TabsTrigger value="news">뉴스</TabsTrigger>
              <TabsTrigger value="initiatives">이니셔티브</TabsTrigger>
              <TabsTrigger value="overseas">K-Diaspora</TabsTrigger>
            </TabsList>
            <TabsContent value="news"><NewsTab /></TabsContent>
            <TabsContent value="initiatives"><InitiativesTab /></TabsContent>
            <TabsContent value="overseas"><OverseasKoreanTab /></TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
