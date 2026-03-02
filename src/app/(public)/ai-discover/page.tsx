import AIDiscoverHero from "@/components/ai-discover/AIDiscoverHero"
import AIPromptInput from "@/components/ai-discover/AIPromptInput"
import AIResultsGrid from "@/components/ai-discover/AIResultsGrid"

export default function AIDiscoverPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <AIDiscoverHero />
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        <AIPromptInput />
      </section>
      <AIResultsGrid />
    </main>
  )
}