import AIDiscoverHero from "@/components/ai-discover/AIDiscoverHero"
import AIPromptInput from "@/components/ai-discover/AIPromptInput"
import AIResultsGrid from "@/components/ai-discover/AIResultsGrid"

export default function AIDiscoverPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black text-white w-full">
      <div className="w-full">
      <AIDiscoverHero />
      </div>
      <div className="w-full">
      <AIResultsGrid />
      </div>
    </main>
  )
}