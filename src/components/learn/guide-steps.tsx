"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Crosshair, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guide, GuideStep } from "@/lib/learn/guides";
import {
  ANIMATIONS,
  FrameSequence,
  PostureAnimation,
  PostureFigure,
  SceneIllustration,
  figureHasPoint,
  type AnimationId,
  type FigureId,
  type FigurePoint,
} from "@/components/visuals/posture-figure";
import { useT } from "@/lib/i18n/use-t";
import type { MessageKey } from "@/lib/i18n/dictionary";

const FIGURE_NAMES: Partial<Record<FigureId, MessageKey>> = { "lap-hands": "learn.inLap", anjali: "learn.anjali" };

/** An animation with step captions, progress dots and a pause button. */
function CaptionedAnimation({ id }: { id: AnimationId }) {
  const anim = ANIMATIONS[id];
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const { t, lang } = useT();

  return (
    <div className="relative">
      <FrameSequence frames={anim.frames} fade={anim.fade} label={anim.label[lang]} playing={playing} onFrameChange={setFrame} className="mx-auto w-full max-w-[220px]" />
      <div className="mt-2 flex items-center justify-center gap-3 pb-1">
        <div className="flex gap-1.5" aria-hidden>
          {anim.frames.map((f, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === frame ? "w-5 bg-[#6D252C]" : "w-1.5 bg-[#8E847C]")} />
          ))}
        </div>
        <p aria-live="polite" className="text-xs font-semibold text-[#6D252C] min-w-[11rem]">
          {anim.frames[frame].caption?.[lang]}
        </p>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? t("learn.pause") : t("learn.play")}
          className="h-8 w-8 rounded-full bg-white border border-[#E7DCC8] flex items-center justify-center text-[#6D252C]"
        >
          {playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

function StepVisual({ step, figureIndex, point }: { step: GuideStep; figureIndex: number; point: FigurePoint | null }) {
  if (step.animation) {
    return ANIMATIONS[step.animation].frames.some((f) => f.caption) ? (
      <CaptionedAnimation id={step.animation} />
    ) : (
      <PostureAnimation id={step.animation} className="mx-auto w-full max-w-[240px]" />
    );
  }
  if (step.scene) return <SceneIllustration id={step.scene} className="mx-auto w-full max-w-[280px]" />;
  if (!step.figures) return null;

  // Several figures (e.g. hand positions) are stacked and cross-faded.
  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      {step.figures.map((f, i) => (
        <div
          key={f}
          className={cn("transition-opacity duration-500", i > 0 && "absolute inset-0")}
          style={{ opacity: i === figureIndex ? 1 : 0 }}
          aria-hidden={i !== figureIndex}
        >
          <PostureFigure id={f} highlight={i === figureIndex ? point : null} decorative={i !== figureIndex} />
        </div>
      ))}
    </div>
  );
}

function StepCard({ step, index }: { step: GuideStep; index: number }) {
  const [figureIndex, setFigureIndex] = useState(0);
  const [point, setPoint] = useState<FigurePoint | null>(null);
  const figure = step.figures?.[figureIndex];
  const hasVisual = Boolean(step.figures || step.scene || step.animation);
  const hasPoints = step.cues?.some((c) => c.point && figure && figureHasPoint(figure, c.point));
  const { t, lang } = useT();

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] overflow-hidden"
    >
      {hasVisual && (
        <div className="relative bg-gradient-to-b from-[#F3ECDF] to-[#FFFCF6] px-4 pt-5 pb-2">
          <StepVisual step={step} figureIndex={figureIndex} point={point} />
          {step.figures && step.figures.length > 1 && (
            <div role="tablist" aria-label={t("learn.handPosition")} className="absolute top-3 right-3 flex rounded-full bg-white/90 p-0.5 border border-[#E7DCC8]">
              {step.figures.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={i === figureIndex}
                  onClick={() => {
                    setFigureIndex(i);
                    setPoint(null);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold transition-colors",
                    i === figureIndex ? "bg-[#6D252C] text-white" : "text-[#6D252C]",
                  )}
                >
                  {FIGURE_NAMES[f] ? t(FIGURE_NAMES[f]) : f}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="h-7 w-7 rounded-full bg-[#6D252C] text-[#F7F2E8] text-sm font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <h2 lang={lang} className="text-[17px] font-bold text-[#2A1A1C] leading-snug">{step.title[lang]}</h2>
        </div>
        <div className="mt-3 space-y-2.5">
          {step.body.map((p) => (
            <p key={p.en} lang={lang} className="text-[15px] text-[#4A4340] leading-relaxed">{p[lang]}</p>
          ))}
        </div>

        {step.cues && (
          <ul className="mt-3 space-y-1.5">
            {step.cues.map((c) => {
              const linked = c.point && figure && figureHasPoint(figure, c.point);
              const active = linked && point === c.point;
              const content = (
                <>
                  <span
                    aria-hidden
                    className={cn("mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 transition-colors", active ? "bg-[#D99A38]" : "bg-[#87977A]")}
                  />
                  <span lang={lang} className="flex-1">{c.text[lang]}</span>
                  {linked && <Crosshair aria-hidden className={cn("mt-1 h-4 w-4 flex-shrink-0", active ? "text-[#D99A38]" : "text-[#C9BCA8]")} />}
                </>
              );
              return (
                <li key={c.text.en}>
                  {linked ? (
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPoint(active ? null : c.point!)}
                      className={cn(
                        "w-full text-left flex gap-2.5 rounded-xl px-2 py-1.5 -mx-2 text-[15px] leading-relaxed transition-colors",
                        active ? "bg-[#FBF0DA] text-[#2A1A1C]" : "text-[#4A4340] hover:bg-[#F7F2E8]",
                      )}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="flex gap-2.5 py-1.5 text-[15px] text-[#4A4340] leading-relaxed">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {hasPoints && <p className="mt-2 text-[11px] text-[#6D645D]">{t("learn.tapPoint")}</p>}

        {step.caution && (
          <p className="mt-4 flex gap-2.5 rounded-2xl bg-[#FBEDEA] border border-[#EDC9C2] px-4 py-3 text-sm text-[#7A2A24] leading-relaxed">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span lang={lang}>{step.caution[lang]}</span>
          </p>
        )}
      </div>
    </motion.li>
  );
}

export function GuideSteps({ guide }: { guide: Guide }) {
  return (
    <ol className="mt-8 space-y-4">
      {guide.steps.map((step, i) => (
        <StepCard key={step.title.en} step={step} index={i} />
      ))}
    </ol>
  );
}
