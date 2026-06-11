import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Move, Check } from "lucide-react";
import type { Popup } from "@/lib/database.types";

interface PopupPositionEditorProps {
  // 미리보기용 콘텐츠
  title: string;
  content: string;
  imageUrl: string;
  // 초기값
  initialX: number; // 화면 대비 % (팝업 좌상단 기준)
  initialY: number;
  initialWidth: number;
  // 겹침 방지용: 이미 배치된 다른 팝업들
  otherPopups?: Popup[];
  onSave: (x: number, y: number, width: number) => void;
  onCancel: () => void;
}

// 프리셋 위치 팝업의 간이 표시 좌표
const PRESET_GHOST_STYLE: Record<string, React.CSSProperties> = {
  center: { left: "50%", top: "40%", transform: "translate(-50%, -50%)" },
  "top-left": { left: "2%", top: "12%" },
  "top-right": { right: "2%", top: "12%" },
  "bottom-left": { left: "2%", bottom: "3%" },
  "bottom-right": { right: "2%", bottom: "3%" },
};

const MIN_WIDTH = 240;
const MAX_WIDTH = 800;

export default function PopupPositionEditor({
  title,
  content,
  imageUrl,
  initialX,
  initialY,
  initialWidth,
  otherPopups = [],
  onSave,
  onCancel,
}: PopupPositionEditorProps) {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [width, setWidth] = useState(initialWidth);

  const areaRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<
    | { mode: "move"; offsetX: number; offsetY: number }
    | { mode: "resize"; startX: number; startWidth: number }
    | null
  >(null);

  const clampPos = useCallback((px: number, py: number, w: number) => {
    const area = areaRef.current?.getBoundingClientRect();
    if (!area) return { px, py };
    const maxX = Math.max(0, ((area.width - w) / area.width) * 100);
    return {
      px: Math.min(Math.max(0, px), maxX),
      py: Math.min(Math.max(0, py), 92),
    };
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const state = dragState.current;
      const area = areaRef.current?.getBoundingClientRect();
      if (!state || !area) return;

      if (state.mode === "move") {
        const rawX = ((e.clientX - area.left - state.offsetX) / area.width) * 100;
        const rawY = ((e.clientY - area.top - state.offsetY) / area.height) * 100;
        const { px, py } = clampPos(rawX, rawY, width);
        setX(px);
        setY(py);
      } else {
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, state.startWidth + (e.clientX - state.startX))
        );
        setWidth(newWidth);
      }
    },
    [clampPos, width]
  );

  const onPointerUp = useCallback(() => {
    dragState.current = null;
    document.body.style.cursor = "";
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const startMove = (e: React.PointerEvent) => {
    const card = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragState.current = {
      mode: "move",
      offsetX: e.clientX - card.left,
      offsetY: e.clientY - card.top,
    };
    document.body.style.cursor = "grabbing";
    e.preventDefault();
  };

  const startResize = (e: React.PointerEvent) => {
    dragState.current = { mode: "resize", startX: e.clientX, startWidth: width };
    document.body.style.cursor = "nwse-resize";
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900/95 flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700">
        <div className="text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Move className="w-4 h-4" />
            팝업 위치/크기 조정
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            팝업을 드래그해서 위치를 잡고, 우하단 모서리를 끌어 크기를 조절하세요. (높이는 내용에 따라 자동)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="bg-transparent text-white border-gray-500 hover:bg-gray-800 hover:text-white">
            <X className="w-4 h-4 mr-1" />취소
          </Button>
          <Button size="sm" className="bg-cordia-teal hover:bg-cordia-green text-white" onClick={() => onSave(Math.round(x * 10) / 10, Math.round(y * 10) / 10, width)}>
            <Check className="w-4 h-4 mr-1" />이 위치로 저장
          </Button>
        </div>
      </div>

      {/* 화면 미리보기 영역 (방문자 화면 비율) */}
      <div ref={areaRef} className="relative flex-1 m-4 rounded-xl overflow-hidden bg-white">
        {/* 사이트 느낌의 가짜 배경 */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="h-14 border-b border-gray-200 flex items-center px-6">
            <div className="w-24 h-5 bg-gray-200 rounded" />
            <div className="ml-auto flex gap-4">
              {[...Array(5)].map((_, i) => <div key={i} className="w-12 h-3 bg-gray-100 rounded" />)}
            </div>
          </div>
          <div className="h-72 bg-gradient-to-br from-gray-300 to-gray-200 flex items-end p-8">
            <div className="space-y-2">
              <div className="w-80 h-7 bg-white/70 rounded" />
              <div className="w-60 h-4 bg-white/50 rounded" />
            </div>
          </div>
          <div className="p-8 grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
          </div>
          <p className="absolute bottom-3 w-full text-center text-xs text-gray-300">
            (방문자 화면 미리보기 — 실제 사이트 비율)
          </p>
        </div>

        {/* 이미 배치된 다른 팝업들 (간이 표시) */}
        {otherPopups.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-xl border-2 border-dashed border-gray-400 bg-gray-200/60 pointer-events-none flex items-center justify-center"
            style={
              p.pos_x != null && p.pos_y != null
                ? { left: `${p.pos_x}%`, top: `${p.pos_y}%`, width: p.width, height: 120 }
                : { ...PRESET_GHOST_STYLE[p.position], width: p.width, height: 120, position: "absolute" }
            }
          >
            <span className="text-xs text-gray-500 font-medium px-3 text-center truncate">
              기존 팝업: {p.title}
            </span>
          </div>
        ))}

        {/* 드래그 가능한 팝업 미리보기 */}
        <div
          className="absolute shadow-2xl rounded-xl border-2 border-cordia-teal overflow-hidden bg-white cursor-grab active:cursor-grabbing select-none"
          style={{ left: `${x}%`, top: `${y}%`, width }}
          onPointerDown={startMove}
        >
          {/* 제목 헤더 (실제 디자인과 동일) */}
          <div className="flex items-center justify-between gap-3 pl-4 pr-2 py-2.5 border-b border-gray-100 pointer-events-none">
            <h3 className="font-bold text-sm text-cordia-dark truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cordia-teal mr-2 align-middle" />
              {title || "제목"}
            </h3>
            <span className="shrink-0 text-gray-300 p-1.5">
              <X className="w-4 h-4" />
            </span>
          </div>
          {imageUrl && <img src={imageUrl} alt="" className="w-full h-auto block pointer-events-none" draggable={false} />}
          {content.trim() && (
            <p className="p-4 text-sm text-gray-600 whitespace-pre-wrap pointer-events-none">{content}</p>
          )}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100 pointer-events-none">
            <span className="text-xs text-gray-400">☐ 오늘 하루 보지 않기</span>
            <span className="text-xs text-gray-400">닫기</span>
          </div>

          {/* 리사이즈 핸들 (우하단) */}
          <div
            onPointerDown={startResize}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1"
          >
            <div className="w-3.5 h-3.5 bg-cordia-teal rounded-tl-md border-2 border-white shadow" />
          </div>
        </div>

        {/* 좌표 표시 */}
        <div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
          위치 {Math.round(x)}%, {Math.round(y)}% · 폭 {width}px
        </div>
      </div>
    </div>
  );
}
