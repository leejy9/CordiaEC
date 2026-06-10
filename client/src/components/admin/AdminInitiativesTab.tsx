import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getInitiatives, updateInitiative } from "@/lib/queries";
import type { Initiative } from "@/lib/database.types";

export default function AdminInitiativesTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Initiative | null>(null);

  const [form, setForm] = useState({
    title: "",
    label: "",
    category: "",
    description: "",
    content: "",
    imageUrl: "",
  });

  const { data: initiatives = [] } = useQuery({
    queryKey: ["initiatives"],
    queryFn: getInitiatives,
  });

  const openEdit = (init: Initiative) => {
    setEditing(init);
    setForm({
      title: init.title,
      label: init.label,
      category: init.category,
      description: init.description,
      content: init.content,
      imageUrl: init.image_url || "",
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      await updateInitiative(editing.slug, {
        title: form.title,
        label: form.label,
        category: form.category,
        description: form.description,
        content: form.content,
        image_url: form.imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["initiatives"] });
      setFormOpen(false);
      toast({ title: "수정 완료" });
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-cordia-dark mb-4">이니셔티브 관리</h2>
        <p className="text-sm text-gray-500">6개 이니셔티브의 정보를 수정할 수 있습니다 (추가/삭제 불가)</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initiatives.map((init) => (
          <Card key={init.slug} className="border border-gray-100">
            <CardContent className="p-4">
              {init.image_url && (
                <img src={init.image_url} alt={init.title} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-semibold text-cordia-dark mb-1">{init.label}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{init.description}</p>
              <Button variant="outline" size="sm" onClick={() => openEdit(init)} className="w-full">
                <Pencil className="w-4 h-4 mr-2" />
                수정
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>이니셔티브 수정: {editing?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>제목</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>라벨</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <Label>분야</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <Label>한줄 설명</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>본문</Label>
              <Textarea
                rows={7}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
            <div>
              <Label>대표 이미지 URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              취소
            </Button>
            <Button
              className="bg-cordia-teal hover:bg-cordia-green text-white"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
