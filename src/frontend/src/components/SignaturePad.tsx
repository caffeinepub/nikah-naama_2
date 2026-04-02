import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface SignaturePadHandle {
  getSignatureDataUrl(): string | null;
  clear(): void;
}

interface SignaturePadProps {
  label?: string;
}

interface DrawPoint {
  clientX: number;
  clientY: number;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ label }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    useImperativeHandle(ref, () => ({
      getSignatureDataUrl(): string | null {
        if (isEmpty) return null;
        return canvasRef.current?.toDataURL("image/png") ?? null;
      },
      clear() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
      },
    }));

    const getPos = (canvas: HTMLCanvasElement, e: DrawPoint) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const startDraw = (pos: { x: number; y: number }) => {
      isDrawing.current = true;
      lastPos.current = pos;
      setIsEmpty(false);
    };

    const draw = (pos: { x: number; y: number }) => {
      if (!isDrawing.current || !lastPos.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.strokeStyle = "#0B5A3A";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    };

    const stopDraw = () => {
      isDrawing.current = false;
      lastPos.current = null;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      startDraw(getPos(canvas, e.nativeEvent));
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      draw(getPos(canvas, e.nativeEvent));
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const touch = e.touches[0];
      startDraw(
        getPos(canvas, { clientX: touch.clientX, clientY: touch.clientY }),
      );
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const touch = e.touches[0];
      draw(getPos(canvas, { clientX: touch.clientX, clientY: touch.clientY }));
    };

    const handleClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <span className="text-xs font-medium" style={{ color: "#0B5A3A" }}>
            {label}
          </span>
        )}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={150}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDraw}
            className="w-full rounded-lg touch-none"
            style={{
              border: "2px dashed #D4AF37",
              backgroundColor: "#ffffff",
              cursor: "crosshair",
              maxHeight: "120px",
            }}
          />
          {isEmpty && (
            <span
              className="absolute inset-0 flex items-center justify-center text-xs pointer-events-none select-none"
              style={{ color: "#ccc" }}
            >
              ✍️ Sign here
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs self-end px-3 py-1 rounded-md transition-colors"
          style={{
            color: "#0B5A3A",
            border: "1px solid #D4AF37",
            background: "transparent",
          }}
        >
          Clear Signature
        </button>
      </div>
    );
  },
);

export default SignaturePad;
