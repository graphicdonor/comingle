import type { Metadata } from "next";
import { PreferencesView } from "@/components/companion/preferences-view";

export const metadata: Metadata = {
  title: "Settings — WePray",
  robots: { index: false },
};

export default function PreferencesPage() {
  return <PreferencesView />;
}
