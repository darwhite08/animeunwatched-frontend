import BlogCard from "./BlogCard"

export default function CreatorDashboard() {
  return (
    <div className="space-y-10">

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold">
          Welcome back, Creator 👋
        </h1>
        <p className="text-white/50 mt-2">
          You’ve gained 1,240 reads this week.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <ActionCard title="Generate with AI" />
        <ActionCard title="Manual Write" />
        <ActionCard title="Review Requests" />
      </div>

      {/* Articles Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Your Articles</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <BlogCard status="Under Review" />
          <BlogCard status="Published" />
          <BlogCard status="Draft" />
        </div>
      </div>

    </div>
  )
}

function ActionCard({ title }: { title: string }) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-indigo-500 transition cursor-pointer">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-white/50 mt-2">
        Create anime content instantly.
      </p>
    </div>
  )
}