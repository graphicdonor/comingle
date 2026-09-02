import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import { SectionLabel } from "@/components/shared/SectionLabel";

const NODE_COUNT = 28;

interface OrbitNode {
  x: number;
  y: number;
  hub: boolean;
}
interface OrbitEdge {
  from: number;
  to: number;
}

/** Deterministic golden-angle spiral: each new node lands near the growing
 * cluster and links back to its nearest existing neighbor, with an
 * occasional extra cross-link once the network has enough mass — organic
 * growth rather than a rigid tree or a grid. */
function generateGraph(): { nodes: OrbitNode[]; edges: OrbitEdge[] } {
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const nodes: OrbitNode[] = [{ x: 0, y: 0, hub: true }];
  const edges: OrbitEdge[] = [];

  for (let i = 1; i < NODE_COUNT; i++) {
    const angle = i * 137.508 * (Math.PI / 180);
    const radius = 15 * Math.sqrt(i);
    const jitter = (rand() - 0.5) * 12;
    const x = Math.cos(angle) * radius + jitter;
    const y = Math.sin(angle) * radius + jitter;

    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let j = 0; j < i; j++) {
      const d = Math.hypot(nodes[j].x - x, nodes[j].y - y);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = j;
      }
    }
    nodes.push({ x, y, hub: i % 6 === 0 });
    edges.push({ from: nearestIdx, to: i });

    if (i > NODE_COUNT * 0.55 && rand() < 0.35) {
      const other = Math.floor(rand() * i);
      if (other !== nearestIdx) edges.push({ from: other, to: i });
    }
  }
  return { nodes, edges };
}

function Node({ node, threshold, progress }: { node: OrbitNode; threshold: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [threshold, threshold + 0.02], [0, 1]);
  const scale = useTransform(progress, [threshold, threshold + 0.04], [0.15, 1]);
  return (
    <motion.circle
      cx={node.x}
      cy={node.y}
      r={node.hub ? 4.2 : 2.4}
      style={{ opacity, scale, transformOrigin: `${node.x}px ${node.y}px` }}
      fill={node.hub ? "#c9ff4d" : "#f4f1ea"}
    />
  );
}

function Edge({ edge, nodes, threshold, progress }: { edge: OrbitEdge; nodes: OrbitNode[]; threshold: number; progress: MotionValue<number> }) {
  const a = nodes[edge.from];
  const b = nodes[edge.to];
  const pathLength = useTransform(progress, [threshold, threshold + 0.03], [0, 1]);
  const opacity = useTransform(progress, [threshold, threshold + 0.015], [0, 0.5]);
  return (
    <motion.line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke="#f4f1ea"
      strokeWidth={0.8}
      style={{ pathLength, opacity }}
    />
  );
}

export function CommunityOrbit() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { nodes, edges } = useMemo(() => generateGraph(), []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0.3]);

  return (
    <section ref={wrapperRef} className="relative h-[280vh] bg-ink">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <motion.div style={{ opacity: textOpacity }} className="relative z-10">
            <SectionLabel>One origin point</SectionLabel>
            <h2 className="mt-4 text-balance font-display text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[0.98] tracking-tight text-bone">
              One person can start something.
            </h2>
            <p className="mt-5 max-w-md text-base text-mist sm:text-lg">
              Every community begins with someone willing to take the first step.
            </p>
          </motion.div>

          <div className="relative aspect-square w-full">
            <svg viewBox="-170 -170 340 340" className="h-full w-full overflow-visible" aria-hidden="true">
              {edges.map((edge, i) => (
                <Edge key={`e-${i}`} edge={edge} nodes={nodes} threshold={(i / edges.length) * 0.92} progress={scrollYProgress} />
              ))}
              {nodes.map((node, i) => (
                <Node key={`n-${i}`} node={node} threshold={(i / nodes.length) * 0.9} progress={scrollYProgress} />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
