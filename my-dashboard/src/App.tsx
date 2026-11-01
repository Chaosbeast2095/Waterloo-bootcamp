import { useCallback, useState } from "react";
import { AppFrame } from "@/components/dashboard/app-frame";
import { FloatBar, Footer, Hero, Navigation, ScrollIntro, type View } from "@/components/dashboard/shell";
import { trend } from "@/data/dashboard";

export default function App() {
  const [view, setView] = useState<View>("overview");
  const [metric, setMetric] = useState(trend.metrics[0].id);
  const [query, setQuery] = useState("");

  const go = useCallback((v: View) => {
    setView(v);
    document.getElementById("app")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const reset = useCallback(() => {
    setView("overview");
    setMetric(trend.metrics[0].id);
    setQuery("");
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-page text-fg">
      <Navigation view={view} go={go} reset={reset} />
      <main>
        <ScrollIntro />
        <Hero go={go}>
          <AppFrame
            view={view}
            setView={setView}
            metric={metric}
            setMetric={setMetric}
            query={query}
            setQuery={setQuery}
            reset={reset}
          />
        </Hero>
      </main>
      <Footer />
      <FloatBar go={go} />
    </div>
  );
}
