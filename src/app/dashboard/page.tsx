"use client";

import Link from "next/link";
import {
  Users,
  Briefcase,
  TrendingUp,
  CheckSquare,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

const pipelineData = [
  { stage: "Lead", count: 48 },
  { stage: "Qualified", count: 32 },
  { stage: "Proposal", count: 18 },
  { stage: "Negotiation", count: 9 },
  { stage: "Closed", count: 6 },
];

const revenueData = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 51000 },
  { month: "Apr", revenue: 47000 },
  { month: "May", revenue: 62000 },
  { month: "Jun", revenue: 58000 },
];

const recentActivities = [
  {
    id: 1,
    name: "Sarah Chen",
    company: "Acme Corp",
    action: "New lead created",
    date: "June 2, 2026",
    type: "lead" as const,
  },
  {
    id: 2,
    name: "Marcus Webb",
    company: "NovaPay Ltd",
    action: "Deal moved to Negotiation",
    date: "June 1, 2026",
    type: "deal" as const,
  },
  {
    id: 3,
    name: "Elena Rossi",
    company: "FinStack",
    action: "Meeting scheduled",
    date: "May 31, 2026",
    type: "task" as const,
  },
  {
    id: 4,
    name: "James Park",
    company: "CloudNine",
    action: "Proposal sent — €18,500",
    date: "May 30, 2026",
    type: "deal" as const,
  },
];

const stats = [
  {
    label: "Total Contacts",
    value: "2,847",
    change: "+12% this month",
    icon: Users,
    color: "from-[#E52629] to-[#C41E3A]",
  },
  {
    label: "Active Deals",
    value: "113",
    change: "€428K pipeline",
    icon: Briefcase,
    color: "from-[#0D0D0D] to-gray-800",
  },
  {
    label: "Revenue (MTD)",
    value: "€58,200",
    change: "+8.4% vs last month",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-700",
  },
  {
    label: "Open Tasks",
    value: "24",
    change: "6 due today",
    icon: CheckSquare,
    color: "from-amber-500 to-amber-700",
  },
];

export default function CrmDashboardPage() {
  return (
    <div className="max-w-full mx-auto space-y-8 pb-12 relative text-left">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-gradient-to-br from-[#E52629] to-[#C41E3A] rounded-full flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#E52629]/20 border border-white/20">
            A
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
              Welcome,{" "}
              <span className="text-[#E52629]">Admin</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">
              CRM Manager · FinTech Operations
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/contacts"
          className="flex items-center gap-2 px-5 py-3 bg-[#0D0D0D] dark:bg-white/10 text-white hover:bg-black/90 dark:hover:bg-white/20 transition-all rounded-xl text-sm font-bold shadow-lg shadow-black/10 cursor-pointer"
        >
          <Users className="size-4 text-[#E52629]" />
          <span>Add contact</span>
        </Link>
      </div>

      {/* Promo banner */}
      <div className="bg-gradient-to-r from-red-50 to-[#FFF3F3] dark:from-[#200B0D] dark:to-[#120506] border border-red-100 dark:border-red-950/30 rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-[#E52629]/10 dark:bg-[#E52629]/20 text-[#E52629] rounded-xl shrink-0">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm md:text-base font-heading">
              Q2 pipeline is 18% ahead of target
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1 leading-relaxed max-w-2xl font-medium">
              Enterprise deals in negotiation are up. Review the forecast and
              assign follow-ups to close before month end.
            </p>
            <Link
              href="/dashboard/master-data/countries"
              className="text-[#E52629] hover:text-[#C41E3A] font-extrabold text-xs md:text-sm mt-3.5 inline-flex items-center gap-1 cursor-pointer"
            >
              View master data
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 overflow-x-auto pt-2 pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { icon: Users, label: "Add contact", primary: true },
          { icon: Briefcase, label: "Create deal" },
          { icon: Phone, label: "Log call" },
          { icon: Mail, label: "Send email" },
          { icon: Plus, label: "New task" },
        ].map(({ icon: Icon, label, primary }) => (
          <button
            key={label}
            type="button"
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all hover:-translate-y-0.5 cursor-pointer ${
              primary
                ? "bg-[#E52629] hover:bg-[#C41E3A] text-white shadow-md shadow-[#E52629]/10"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-100 dark:bg-[#121212] dark:hover:bg-[#1A1A1A] dark:text-gray-200 dark:border-white/5"
            }`}
          >
            <Icon
              className={`size-4 ${primary ? "text-white" : "text-gray-400 dark:text-gray-500"}`}
            />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {stat.label}
              </span>
              <div
                className={`size-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white border border-white/10 shadow-sm`}
              >
                <stat.icon className="size-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
              {stat.value}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight font-heading">
              Revenue trend
            </h2>
            <select className="bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 outline-none hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E52629" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E52629" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-[#0D0D0D] text-white p-2.5 rounded-lg border border-white/10 shadow-lg text-[10px] font-bold">
                          <p>{payload[0].payload.month}</p>
                          <p className="text-[#E52629] mt-0.5">
                            €{Number(payload[0].value).toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E52629"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                />
                <XAxis dataKey="month" hide />
                <YAxis hide domain={["dataMin - 5000", "dataMax + 5000"]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight font-heading">
            Sales pipeline
          </h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={90}
                  tick={{ fontSize: 11, fontWeight: 700 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-[#0D0D0D] text-white p-2.5 rounded-lg border border-white/10 shadow-lg text-[10px] font-bold">
                          {payload[0].payload.stage}: {payload[0].value} deals
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#E52629" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
              Recent activity
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
              Latest CRM updates across your team
            </p>
          </div>
          <Link
            href="/dashboard/contacts"
            className="text-xs font-bold text-[#E52629] hover:text-[#C41E3A] transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="space-y-3.5">
          {recentActivities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 hover:bg-red-50/20 dark:hover:bg-white/[0.02] border border-transparent hover:border-red-50 dark:hover:border-white/5 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-11 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105 ${
                    item.type === "deal"
                      ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20"
                      : item.type === "lead"
                        ? "bg-[#E52629]/10 text-[#E52629] border border-[#E52629]/20"
                        : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  {item.type === "deal" ? (
                    <ArrowDownLeft className="size-5" />
                  ) : (
                    <ArrowUpRight className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-950 dark:text-gray-100 font-heading truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {item.company}
                    </span>
                    <span className="hidden sm:block size-1 bg-gray-200 dark:bg-white/10 rounded-full" />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {item.action}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold shrink-0">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
