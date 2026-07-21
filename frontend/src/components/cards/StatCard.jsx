export default function StatCard({
  title,
  value,
  subtitle,
  color = "text-cyan-400",
}) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg hover:scale-105 transition duration-300">
      <h3 className="text-slate-400 text-sm">{title}</h3>

      <h1 className={`text-4xl font-bold mt-3 ${color}`}>
        {value}
      </h1>

      <p className="text-slate-500 mt-4 text-sm">
        {subtitle}
      </p>
    </div>
  );
}