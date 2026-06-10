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
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from "@/lib/queries";
import type { Milestone } from "@/lib/database.types";

export default function AdminMilestonesTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    periodLabel: "",
    title: "",
    description: "",
    imageUrl: "",
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["milestones"],
    queryFn: getMilestones,
  });

  const openCreate = () => {
    setForm({ periodLabel: "", title: "", description: "", imageUrl: "" });
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (m: Milestone) => {
    setEditing(m);
    setForm({
      periodLabel: m.period_label,
      title: m.title,
      description: m.description,
      imageUrl: m.image_url || "",
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await updateMilestone(editing.id, {
          period_label: form.periodLabel,
          title: form.title,
          description: form.description,
          image_url: form.imageUrl,
        });
      } else {
        await createMilestone({
          period_label: form.periodLabel,
          title: form.title,
          description: form.description,
          image_url: form.imageUrl,
          display_order: milestones.length + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
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
    mutationFn: (id: string) => deleteMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
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

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; order: number }[]) => {
      for (const { id, order } of updates) {
        await updateMilestone(id, { display_order: order });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      toast({ title: "순서 변경 완료" });
    },
  });

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...milestones];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    reorderMutation.mutate(
      newOrder.map((m, i) => ({ id: m.id, order: i + 1 }))
    );
  };

  const moveDown = (index: number) => {
    if (index === milestones.length - 1) return;
    const newOrder = [...milestones];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMutation.mutate(
      newOrder.map((m, i) => ({ id: m.id, order: i + 1 }))
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cordia-dark">연혁</h2>
        <Button onClick={openCreate} className="bg-cordia-teal hover:bg-cordia-green text-white">
          <Plus className="w-4 h-4 mr-2" />
          새 항목
        </Button>
      </div>

      <div className="space-y-3">
        {milestones.map((m, idx) => (
          <Card key={m.id} className="border border-gray-100">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {m.image_url && <img src={m.image_url} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />}
                <div className="min-w-0">
                  <p className="font-semibold text-cordia-dark">{m.period_label}</p>
                  <p className="text-sm text-gray-600 truncate">{m.title}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0 || reorderMutation.isPending}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveDown(idx)}
                  disabled={idx === milestones.length - 1 || reorderMutation.isPending}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => setDeleteTarget(m.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "연혁 수정" : "새 연혁 항목"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>시기 라벨</Label>
              <Input
                value={form.periodLabel}
                onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
                placeholder="예: Founded in 1985"
              />
            </div>
            <div>
              <Label>제목</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목"
              />
            </div>
            <div>
              <Label>설명</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="설명"
              />
            </div>
            <div>
              <Label>이미지 URL</Label>
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
