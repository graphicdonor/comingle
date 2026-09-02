import { motion } from "framer-motion";
import { useState } from "react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { STORIES, type Story } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function StoryPortrait({ story, hovered }: { story: Story; hovered: boolean }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-line">
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 120% at 20% 15%, ${story.palette[0]}33, ${story.palette[1]} 60%)` }}
        animate={{ scale: hovered ? 1.08 : 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      <motion.span
        className="absolute inset-0 flex items-center justify-center font-display text-8xl font-semibold text-bone/10"
        animate={{ scale: hovered ? 1.12 : 1, opacity: hovered ? 0.16 : 0.08 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {initials(story.name)}
      </motion.span>
      <motion.div
        className="absolute inset-0"
        style={{ boxShadow: `inset 0 0 90px ${story.palette[0]}00` }}
        animate={{ boxShadow: hovered ? `inset 0 0 90px ${story.palette[0]}40` : `inset 0 0 90px ${story.palette[0]}00` }}
        transition={{ duration: 0.8, ease: EASE }}
      />
    </div>
  );
}

function StoryCard({ story, hovered, dimmed, onHover, onLeave }: { story: Story; hovered: boolean; dimmed: boolean; onHover: () => void; onLeave: () => void }) {
  return (
    <motion.article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      tabIndex={0}
      className="relative"
      animate={{ opacity: dimmed ? 0.35 : 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <StoryPortrait story={story} hovered={hovered} />
      <motion.blockquote
        className="mt-5 text-balance font-display text-xl font-medium leading-snug text-bone"
        animate={{ scale: hovered ? 1.03 : 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ transformOrigin: "left" }}
      >
        “{story.quote}”
      </motion.blockquote>
      <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
        <span>
          {story.name} — {story.location}
        </span>
      </div>
      <p className="mt-1 text-sm text-fog">{story.action}</p>
    </motion.article>
  );
}

export function CommunityStories() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-ink py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <SectionLabel>Community stories</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-bone">
          Real people.
          <br />
          Real change.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {STORIES.map((story, i) => (
            <StoryCard
              key={story.name}
              story={story}
              hovered={hoveredIndex === i}
              dimmed={hoveredIndex !== null && hoveredIndex !== i}
              onHover={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
