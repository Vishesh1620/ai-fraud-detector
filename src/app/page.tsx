import { AnalysisClient } from "@/components/analysis-client";

export default function Home() {
  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnalysisClient />
      </div>
    </main>
  );
}
