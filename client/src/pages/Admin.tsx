import { useState } from "react";
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
import { Plus, Pencil, Trash2, Lock, Calendar, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle, Initiative, OverseasKoreanPost } from "@shared/schema";

const ADMIN_PASSWORD = "cordia2025";

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
            <p className="text-gray-500 text-sm mt-1">Enter the admin password to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  placeholder="Enter admin password"
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-red-500 text-sm mt-1">Incorrect password. Please try again.</p>}
              </div>
              <Button type="submit" className="w-full bg-cordia-teal hover:bg-cordia-green text-white">
                Login
              </Button>
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
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", imageUrl: "", publishedDate: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/news", 1, 100],
    queryFn: async () => {
      const res = await fetch("/api/news?page=1&limit=100");
      return res.json();
    },
  });

  const articles: NewsArticle[] = data?.articles || [];

  const resetForm = () => setForm({ title: "", excerpt: "", content: "", imageUrl: "", publishedDate: new Date().toISOString().split("T")[0] });

  const openCreate = () => { resetForm(); setEditing(null); setFormOpen(true); };
  const openEdit = (a: NewsArticle) => {
    setEditing(a);
    setForm({
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      imageUrl: a.imageUrl || "",
      publishedDate: new Date(a.publishedDate).toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, imageUrl: form.imageUrl || null, publishedDate: new Date(form.publishedDate).toISOString() };
      const url = editing ? `/api/news/${editing.id}` : "/api/news";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setFormOpen(false);
      toast({ title: editing ? "Article updated" : "Article created", description: "Changes saved successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save article.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setDeleteTarget(null);
      toast({ title: "Article deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete article.", variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">News Articles <Badge variant="secondary">{articles.length}</Badge></h2>
        <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white">
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No news articles yet. Create one!</div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Card key={a.id} className="border border-gray-100">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-cordia-dark truncate">{a.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(a.publishedDate).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">{a.excerpt}</p>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Excerpt *</Label><Textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} /></div>
            <div><Label>Content *</Label><Textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div><Label>Image URL (optional)</Label><Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><Label>Published Date *</Label><Input type="date" value={form.publishedDate} onChange={e => setForm(f => ({ ...f, publishedDate: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              className="bg-cordia-teal hover:bg-cordia-green text-white"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.title || !form.excerpt || !form.content || !form.publishedDate}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Initiatives Tab ----
function InitiativesTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", description: "", content: "", imageUrl: "", category: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/initiatives"],
    queryFn: async () => {
      const res = await fetch("/api/initiatives");
      return res.json();
    },
  });

  const items: Initiative[] = data?.initiatives || [];

  const resetForm = () => setForm({ slug: "", title: "", description: "", content: "", imageUrl: "", category: "" });

  const openCreate = () => { resetForm(); setEditing(null); setFormOpen(true); };
  const openEdit = (item: Initiative) => {
    setEditing(item);
    setForm({ slug: item.slug, title: item.title, description: item.description, content: item.content, imageUrl: item.imageUrl || "", category: item.category });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, imageUrl: form.imageUrl || null };
      const url = editing ? `/api/initiatives/${editing.id}` : "/api/initiatives";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] });
      setFormOpen(false);
      toast({ title: editing ? "Initiative updated" : "Initiative created" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save initiative.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/initiatives/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] });
      setDeleteTarget(null);
      toast({ title: "Initiative deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">Initiatives <Badge variant="secondary">{items.length}</Badge></h2>
        <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white">
          <Plus className="w-4 h-4 mr-2" /> New Initiative
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No initiatives yet. Create one!</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border border-gray-100">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cordia-dark truncate">{item.title}</p>
                    <Badge variant="outline" className="text-xs shrink-0">{item.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-1">slug: {item.slug}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Initiative" : "New Initiative"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Slug * <span className="text-xs text-gray-400">(URL identifier, e.g. k-food)</span></Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="k-food" /></div>
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Category *</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Food & Beverage" /></div>
            <div><Label>Description *</Label><Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Content *</Label><Textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div><Label>Image URL (optional)</Label><Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              className="bg-cordia-teal hover:bg-cordia-green text-white"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.slug || !form.title || !form.category || !form.description || !form.content}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Initiative?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Overseas Korean Tab ----
function OverseasKoreanTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OverseasKoreanPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", imageUrl: "", linkUrl: "", publishedDate: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/overseas-korean", 1, 100],
    queryFn: async () => {
      const res = await fetch("/api/overseas-korean?page=1&limit=100");
      return res.json();
    },
  });

  const posts: OverseasKoreanPost[] = data?.posts || [];

  const resetForm = () => setForm({ title: "", excerpt: "", content: "", imageUrl: "", linkUrl: "", publishedDate: new Date().toISOString().split("T")[0] });

  const openCreate = () => { resetForm(); setEditing(null); setFormOpen(true); };
  const openEdit = (p: OverseasKoreanPost) => {
    setEditing(p);
    setForm({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      imageUrl: p.imageUrl || "",
      linkUrl: p.linkUrl || "",
      publishedDate: new Date(p.publishedDate).toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, imageUrl: form.imageUrl || null, linkUrl: form.linkUrl || null, publishedDate: new Date(form.publishedDate).toISOString() };
      const url = editing ? `/api/overseas-korean/${editing.id}` : "/api/overseas-korean";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overseas-korean"] });
      setFormOpen(false);
      toast({ title: editing ? "Post updated" : "Post created" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save post.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/overseas-korean/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overseas-korean"] });
      setDeleteTarget(null);
      toast({ title: "Post deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">재외동포 Posts <Badge variant="secondary">{posts.length}</Badge></h2>
        <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No posts yet. Create the first post!</div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className="border border-gray-100">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-cordia-dark truncate">{p.title}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.publishedDate).toLocaleDateString()}</span>
                    {p.linkUrl && <span className="flex items-center gap-1 text-cordia-teal"><ExternalLink className="w-3 h-3" />Has link</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">{p.excerpt}</p>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Excerpt *</Label><Textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} /></div>
            <div><Label>Content *</Label><Textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div><Label>Image URL (optional)</Label><Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><Label>External Link URL (optional)</Label><Input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><Label>Published Date *</Label><Input type="date" value={form.publishedDate} onChange={e => setForm(f => ({ ...f, publishedDate: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              className="bg-cordia-teal hover:bg-cordia-green text-white"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.title || !form.excerpt || !form.content || !form.publishedDate}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}>Delete</AlertDialogAction>
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

  if (!authenticated) {
    return <LoginGate onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-[80vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cordia-dark">Admin Panel</h1>
              <p className="text-gray-500 mt-1">Manage all content boards</p>
            </div>
            <Button
              variant="outline"
              onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthenticated(false); }}
            >
              <Lock className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          <Tabs defaultValue="news">
            <TabsList className="mb-6">
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
              <TabsTrigger value="overseas">재외동포</TabsTrigger>
            </TabsList>
            <TabsContent value="news">
              <NewsTab />
            </TabsContent>
            <TabsContent value="initiatives">
              <InitiativesTab />
            </TabsContent>
            <TabsContent value="overseas">
              <OverseasKoreanTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
