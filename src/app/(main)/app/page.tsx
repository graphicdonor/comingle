import type { Metadata } from "next";
import { TodayView } from "@/components/companion/today-view";

export const metadata: Metadata = {
  title: "Today — WePray",
  alternates: { canonical: "/app" },
};

export default function TodayPage() {
  return <TodayView />;
}
