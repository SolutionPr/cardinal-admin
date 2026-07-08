"use client";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="max-w-3xl mx-auto text-left space-y-4">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight font-heading">
        {title}
      </h1>
      <p className="text-gray-500 text-sm font-medium leading-relaxed">
        {description}
      </p>
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-dashed">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Coming soon
        </p>
        <p className="text-sm text-gray-600 mt-2">
          This CRM module uses the same layout, typography, and dark mode as
          the cardinal-fintech dashboard.
        </p>
      </div>
    </div>
  );
}
