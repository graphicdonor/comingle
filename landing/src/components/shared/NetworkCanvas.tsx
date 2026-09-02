import { useEffect, useRef } from "react";

type Hue = "bone" | "lime" | "green" | "cyan";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hub: boolean;
  hue: Hue;
  bob: number;
}

interface Signal {
  from: Node;
  to: Node;
  t: number;
  speed: number;
}

const HUE_COLOR: Record<Hue, string> = {
  bone: "244, 241, 234",
  lime: "201, 255, 77",
  green: "142, 240, 176",
  cyan: "111, 227, 255",
};

/** Deterministic pseudo-random curve bow per node pair, so connecting lines
 * stay organically curved instead of perfectly straight without needing to
 * store extra per-pair state or re-randomize every frame. */
function pairBow(ax: number, ay: number, bx: number, by: number) {
  const seed = Math.sin(ax * 12.9898 + ay * 78.233 + bx * 37.719 + by * 4.618) * 43758.5453;
  return ((seed - Math.floor(seed)) - 0.5) * 46;
}

export interface NetworkCanvasProps {
  className?: string;
  density?: number;
  hubRatio?: number;
  interactive?: boolean;
  paused?: boolean;
  connectDistance?: number;
}

export function NetworkCanvas({
  className,
  density = 70,
  hubRatio = 0.12,
  interactive = true,
  paused = false,
  connectDistance = 150,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context2d = canvas.getContext("2d");
    if (!context2d) return;
    // Re-bound with an explicit non-null type: the nested `resize`/`step`
    // closures below run long after this check, and TS's control-flow
    // narrowing doesn't carry a null-check across a closure boundary.
    const ctx: CanvasRenderingContext2D = context2d;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let signals: Signal[] = [];
    let frameId = 0;
    let lastSignalAt = 0;

    function seedNodes() {
      nodes = Array.from({ length: density }, () => {
        const hub = Math.random() < hubRatio;
        const hues: Hue[] = ["lime", "green", "cyan"];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: hub ? 2.6 + Math.random() * 1.4 : 1.1 + Math.random() * 1.2,
          hub,
          hue: hub ? hues[Math.floor(Math.random() * hues.length)] : "bone",
          bob: Math.random() * Math.PI * 2,
        };
      });
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    }

    function step(time: number) {
      ctx.clearRect(0, 0, width, height);

      // Soft glow following the pointer, painted beneath everything else.
      if (interactive && pointer.current.active) {
        const gradient = ctx.createRadialGradient(
          pointer.current.x, pointer.current.y, 0,
          pointer.current.x, pointer.current.y, 220
        );
        gradient.addColorStop(0, "rgba(201, 255, 77, 0.06)");
        gradient.addColorStop(1, "rgba(201, 255, 77, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      for (const node of nodes) {
        node.bob += 0.004;
        node.x += node.vx + Math.sin(node.bob) * 0.03;
        node.y += node.vy + Math.cos(node.bob * 0.8) * 0.03;

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;

        if (interactive && pointer.current.active) {
          const dx = node.x - pointer.current.x;
          const dy = node.y - pointer.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0.01) {
            const force = (1 - dist / 130) * 0.6;
            node.vx += (dx / dist) * force * 0.02;
            node.vy += (dy / dist) * force * 0.02;
          }
        }
        node.vx *= 0.98;
        node.vy *= 0.98;
      }

      // Connections — curved, distance-faded, brighter between hub nodes.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > connectDistance) continue;

          const strength = 1 - dist / connectDistance;
          const bothHub = a.hub && b.hub;
          const bow = pairBow(Math.round(a.x / 40), Math.round(a.y / 40), Math.round(b.x / 40), Math.round(b.y / 40));
          const mx = (a.x + b.x) / 2 - (b.y - a.y) * (bow / 200);
          const my = (a.y + b.y) / 2 + (b.x - a.x) * (bow / 200);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
          ctx.strokeStyle = bothHub
            ? `rgba(201, 255, 77, ${0.12 * strength})`
            : `rgba(244, 241, 234, ${0.05 * strength})`;
          ctx.lineWidth = bothHub ? 1 : 0.6;
          ctx.stroke();
        }
      }

      // Traveling "signal" pulses along hub-to-hub links, suggesting activity
      // moving through the network rather than a static diagram.
      if (time - lastSignalAt > 1400 && !paused) {
        const hubs = nodes.filter((n) => n.hub);
        if (hubs.length >= 2) {
          const from = hubs[Math.floor(Math.random() * hubs.length)];
          let to = hubs[Math.floor(Math.random() * hubs.length)];
          let guard = 0;
          while (to === from && guard < 5) {
            to = hubs[Math.floor(Math.random() * hubs.length)];
            guard++;
          }
          if (to !== from && Math.hypot(from.x - to.x, from.y - to.y) < connectDistance * 2.4) {
            signals.push({ from, to, t: 0, speed: 0.012 + Math.random() * 0.008 });
            lastSignalAt = time;
          }
        }
      }

      signals = signals.filter((s) => s.t < 1);
      for (const s of signals) {
        s.t += s.speed;
        const x = s.from.x + (s.to.x - s.from.x) * s.t;
        const y = s.from.y + (s.to.y - s.from.y) * s.t;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${HUE_COLOR[s.from.hue]}, ${1 - s.t * 0.3})`;
        ctx.shadowColor = `rgba(${HUE_COLOR[s.from.hue]}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Nodes on top.
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.hub
          ? `rgba(${HUE_COLOR[node.hue]}, 0.85)`
          : "rgba(244, 241, 234, 0.35)";
        if (node.hub) {
          ctx.shadowColor = `rgba(${HUE_COLOR[node.hue]}, 0.6)`;
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!paused) frameId = requestAnimationFrame(step);
    }

    resize();
    frameId = requestAnimationFrame(step);

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.current.x = e.clientX - rect.left;
      pointer.current.y = e.clientY - rect.top;
      pointer.current.active = true;
    }
    function onPointerLeave() {
      pointer.current.active = false;
    }

    if (interactive) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      if (interactive) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, [density, hubRatio, interactive, paused, connectDistance]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
