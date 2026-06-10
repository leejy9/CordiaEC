import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Move, Check } from "lucide-react";

interface PopupPositionEditorProps {
  // 미리보기용 콘텐츠
  title: string;
  content: string;
  imageUrl: string;
  // 초기값
  initialX: number; // 화면 대비 % (팝업 좌상단 기준)
  initialY: number;
  initialWidth: number;
  onSave: (x: number, y: number, width: number) => void;
  onCancel: () => void;
}

const MIN_WIDTH = 240;
const MAX_WIDTH = 800;

export default function PopupPositionEditor({
  title,
  content,
  imageUrl,
  initialX,
  initialY,
  initialWidth,
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

        {/* 드래그 가능한 팝업 미리보기 */}
        <div
          className="absolute shadow-2xl rounded-xl border-2 border-cordia-teal overflow-hidden bg-white cursor-grab active:cursor-grabbing select-none"
          style={{ left: `${x}%`, top: `${y}%`, width }}
          onPointerDown={startMove}
        >
          {imageUrl && <img src={imageUrl} alt="" className="w-full h-auto pointer-events-none" draggable={false} />}
          {(title || content) && (
            <div className="p-4 pointer-events-none">
              <h3 className="font-bold text-cordia-dark mb-1">{title || "제목"}</h3>
              {content && <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>}
            </div>
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
