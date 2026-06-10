import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSiteSettings, updateSiteSetting, getPosts } from "@/lib/queries";
import type { Post } from "@/lib/database.types";

export default function AdminHomeSettingsTab() {
  const { toast } = useToast();
  const [boardTitle, setBoardTitle] = useState("Latest News");
  const [boardCount, setBoardCount] = useState("3");
  const [pinnedPosts, setPinnedPosts] = useState<string[]>([]);

  const { data: settings = {} } = useQuery({
    queryKey: ["site_settings"],
    queryFn: getSiteSettings,
  });

  const { data: postsData } = useQuery({
    queryKey: ["posts_news"],
    queryFn: () => getPosts({ board: "news", page: 1, limit: 100 }),
  });

  useEffect(() => {
    if (settings) {
      setBoardTitle(settings.home_board_title || "Latest News");
      setBoardCount(settings.home_board_count || "3");
    }
  }, [settings]);

  const posts = postsData?.posts || [];
  const pinnedPostsList = posts.filter((p) => p.is_pinned_home);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await updateSiteSetting("home_board_title", boardTitle);
      await updateSiteSetting("home_board_count", boardCount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast({ title: "설정 저장 완료" });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>홈 게시판 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>게시판 섹션 제목</Label>
            <Input value={boardTitle} onChange={(e) => setBoardTitle(e.target.value)} placeholder="예: Latest News" />
            <p className="text-xs text-gray-400 mt-1">홈 화면에 표시될 게시판 제목입니다.</p>
          </div>

          <div>
            <Label>노출 건수</Label>
            <Input
              type="number"
              value={boardCount}
              onChange={(e) => setBoardCount(e.target.value)}
              placeholder="3"
              min="1"
              max="20"
            />
            <p className="text-xs text-gray-400 mt-1">홈 게시판에 표시할 최신 글의 개수입니다.</p>
          </div>

          <Button
            className="bg-cordia-teal hover:bg-cordia-green text-white"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "저장 중..." : "설정 저장"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>홈 게시판 고정글 ({pinnedPostsList.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {pinnedPostsList.length === 0 ? (
            <p className="text-gray-400 text-sm">고정된 글이 없습니다. 게시글 탭에서 설정하세요.</p>
          ) : (
            <div className="space-y-2">
              {pinnedPostsList.map((post) => (
                <div key={post.id} className="p-3 bg-gray-50 rounded-lg border border-cordia-teal/20">
                  <p className="font-semibold text-sm text-cordia-dark">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(post.published_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">
            게시글 탭에서 각 글의 is_pinned_home 옵션을 활성화하면 홈 게시판에 고정됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
