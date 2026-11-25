import type { CmsData, CmsType } from "@/lib/cms/model";

const DRAFT = { status: "draft" } as const;

/** A starting point for new content: valid shape, placeholder text to replace. */
export function template(type: CmsType, slug: string): CmsData[CmsType] {
  if (type === "prayer")
    return {
      slug,
      title: { pi: "Pali title", hi: "हिन्दी शीर्षक", en: "English title" },
      category: { hi: "वंदना", en: "Homage" },
      summary: { hi: "संक्षिप्त परिचय", en: "A short description" },
      tradition: "Theravāda / Pali",
      durationMinutes: 2,
      sections: [{ lines: [{ pi: "Pali line", hi: "हिन्दी अर्थ", en: "English meaning" }] }],
      source: { title: "Source title", reference: "Reference, e.g. Khuddakapāṭha 1" },
      review: { pali: DRAFT, hi: DRAFT, en: DRAFT },
      audio: null,
    };
  if (type === "meditation")
    return {
      id: slug,
      title: { hi: "हिन्दी नाम", en: "English name" },
      pali: "Pali name",
      summary: { hi: "एक पंक्ति में परिचय", en: "One-line description" },
      steps: [{ hi: "पहला चरण", en: "First step" }],
      context: { hi: "परंपरा और संदर्भ", en: "Tradition and context" },
    };
  if (type === "story")
    return {
      slug,
      number: 1,
      title: { pi: "Pali title, e.g. Sasa Jātaka", hi: "हिन्दी शीर्षक", en: "English title" },
      theme: { hi: "गुण, जैसे दान", en: "Quality, e.g. Generosity" },
      summary: { hi: "एक पंक्ति में कथा", en: "The story in one line" },
      paragraphs: [{ hi: "पहला अनुच्छेद", en: "First paragraph" }],
      lesson: { hi: "कथा की सीख", en: "What the story teaches" },
      minutes: 2,
      source: { title: "Jātaka (Khuddaka Nikāya)", reference: "Jātaka 1" },
      review: { hi: DRAFT, en: DRAFT },
    };
  return { reference: "Dhammapada 1", pi: ["Pali line"], hi: "हिन्दी अनुवाद", en: "English translation", review: "draft" };
}
