import { Calendar, Download, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdminChart from "@/components/admin/admin-chart";

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalRevenueAgg,
    activeSubscribers,
    eliteSubs,
    masterSubs,
    totalUsers,
    publishedExams,
    publishedSkbExams,
    recentTransactions,
    last30DaysTransactions,
    last30DaysSignups
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true }
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "ACTIVE", planType: "ELITE" } }),
    prisma.subscription.count({ where: { status: "ACTIVE", planType: "MASTER" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.exam.count({ where: { status: "PUBLISHED" } }),
    prisma.sKBExam.count({ where: { status: "PUBLISHED" } }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } } }
    }),
    prisma.transaction.findMany({
      where: { 
        status: "SUCCESS",
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true, amount: true }
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true }
    })
  ]);

  const chartData: { date: string; revenue: number; signups: number; fullDate: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    chartData.push({
      date: new Intl.DateTimeFormat('id-ID', { month: 'short', day: 'numeric' }).format(d),
      revenue: 0,
      signups: 0,
      fullDate: d.toISOString().split('T')[0]
    });
  }

  last30DaysTransactions.forEach(tx => {
    const dateStr = tx.createdAt.toISOString().split('T')[0];
    const item = chartData.find(d => d.fullDate === dateStr);
    if (item) {
      item.revenue += tx.amount / 100;
    }
  });

  last30DaysSignups.forEach(u => {
    const dateStr = u.createdAt.toISOString().split('T')[0];
    const item = chartData.find(d => d.fullDate === dateStr);
    if (item) {
      item.signups += 1;
    }
  });

  const totalRevenue = totalRevenueAgg._sum.amount || 0;
  const formattedRevenue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalRevenue / 100); // Assuming amount is in cents, or if it's in IDR, remove / 100. Wait, schema says "in IDR cents (e.g. 14900000 = Rp149.000)" -> so / 100.

  const conversionRate = totalUsers > 0 ? ((activeSubscribers / totalUsers) * 100).toFixed(1) : "0";
  const activeExamsCount = publishedExams + publishedSkbExams;

  const elitePct = activeSubscribers > 0 ? Math.round((eliteSubs / activeSubscribers) * 100) : 0;
  const masterPct = activeSubscribers > 0 ? Math.round((masterSubs / activeSubscribers) * 100) : 0;

  function fmtDate(d: Date) {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 w-full space-y-8 flex-1">
      
      {/* Page Hero / Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1 lg:mb-2 text-opacity-80">Institutional Analytics</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Revenue Overview</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Real-time performance metrics and subscriber insights.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Total Revenue Card (Wide) */}
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between overflow-hidden relative group border border-slate-100">
          <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="w-32 h-32 bg-brand-blue-deep rounded-full blur-2xl"></div>
          </div>
          <div className="relative z-10 w-full mb-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mt-1 tracking-tight">{formattedRevenue}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-brand-blue-deep font-black text-xs rounded-full">Active</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">all time</span>
            </div>
          </div>
          <div className="mt-auto h-12 w-full flex items-end gap-1.5 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="flex-1 bg-blue-100 rounded-t-sm h-[30%]"></div>
            <div className="flex-1 bg-blue-200 rounded-t-sm h-[40%]"></div>
            <div className="flex-1 bg-blue-300 rounded-t-sm h-[50%]"></div>
            <div className="flex-1 bg-brand-blue-light rounded-t-sm h-[80%]"></div>
            <div className="flex-1 bg-blue-500 rounded-t-sm h-[60%]"></div>
            <div className="flex-1 bg-brand-blue rounded-t-sm h-[90%]"></div>
            <div className="flex-1 bg-brand-blue-deep rounded-t-sm h-[75%]"></div>
            <div className="flex-1 bg-brand-blue-deep rounded-t-sm h-[85%]"></div>
            <div className="flex-1 bg-blue-900 rounded-t-sm h-[100%] shadow-[0_0_10px_rgba(13,148,136,0.5)]"></div>
          </div>
        </div>

        {/* Active Subscribers Card */}
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between border border-slate-100">
            <div className="w-full">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Subscribers</p>
                <Users className="w-5 h-5 text-brand-blue" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{activeSubscribers}</h3>
            </div>
          <div className="mt-8 space-y-4 w-full">
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-brand-blue-deep">Elite Plan</span>
                <span className="text-slate-500">{eliteSubs} ({elitePct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-blue h-full rounded-full" style={{ width: `${elitePct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-slate-600">Master Plan</span>
                <span className="text-slate-500">{masterSubs} ({masterPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: `${masterPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="md:col-span-1 lg:col-span-1 bg-white rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between items-center border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider w-full text-left">Conversion</p>
          <div className="flex flex-col items-center justify-center py-4 relative my-auto">
            <svg className="w-24 h-24 transform -rotate-90 overflow-visible" viewBox="0 0 96 96">
              <circle className="text-slate-100" cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" strokeWidth="10"></circle>
              <circle 
                className="text-amber-500 drop-shadow-md" 
                cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" 
                strokeDasharray="226.19" strokeDashoffset={226.19 - (Number(conversionRate) / 100) * 226.19} strokeLinecap="round" strokeWidth="10"
              ></circle>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-slate-900">{conversionRate}%</span>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider w-full">Total Users: {totalUsers}</p>
        </div>

        {/* Active Exams Card */}
        <div className="md:col-span-1 lg:col-span-1 bg-brand-blue-deep rounded-[1.5rem] p-6 shadow-md flex flex-col justify-between text-white border border-brand-blue-deep relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-sm font-bold text-blue-200 uppercase tracking-wider relative z-10 w-full text-left">Active Exams</p>
          <div className="relative z-10 mt-auto">
            <h3 className="text-4xl font-black text-white mt-1 tracking-tight">{activeExamsCount}</h3>
            <div className="mt-3 text-[11px] font-bold text-blue-300 flex items-center gap-1.5 bg-blue-900/50 w-max px-2.5 py-1 rounded-full uppercase tracking-wider">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              Live Now
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Area Chart Section */}
      <AdminChart data={chartData} />

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h3>
          <a className="text-xs font-black uppercase text-brand-blue-deep hover:text-brand-blue-deep bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors tracking-widest" href="/admin/transactions">View All Activity</a>
        </div>
        
        <div className="bg-white rounded-[1.5rem] shadow-sm overflow-x-auto border border-slate-100">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No transactions yet.</td>
                </tr>
              ) : recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-inner
                         ${tx.planType === "ELITE" ? "bg-brand-blue-deep" : tx.planType === "MASTER" ? "bg-amber-600" : "bg-slate-600"}`}>
                        {tx.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue-deep transition-colors">{tx.user.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{tx.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-widest
                      ${tx.planType === "ELITE" ? "bg-blue-50 text-brand-blue-deep border border-blue-100" : tx.planType === "MASTER" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-700 border border-slate-200"}
                    `}>
                      {tx.planType}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-slate-900 tracking-tight">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(tx.amount / 100)}
                  </td>
                  <td className="px-6 py-5 text-xs font-semibold text-slate-500">{fmtDate(tx.createdAt)}</td>
                  <td className="px-6 py-5">
                    {tx.status === "SUCCESS" ? (
                      <div className="flex items-center justify-center gap-1.5 text-brand-blue font-bold text-[10px] bg-blue-50/50 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest w-full group-hover:bg-blue-50 transition-colors">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         Success
                      </div>
                    ) : tx.status === "PENDING" ? (
                      <div className="flex items-center justify-center gap-1.5 text-amber-600 font-bold text-[10px] bg-amber-50/50 py-1.5 rounded-lg border border-amber-100 uppercase tracking-widest w-full group-hover:bg-amber-50 transition-colors">
                         <Clock className="w-3.5 h-3.5" />
                         Pending
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-red-600 font-bold text-[10px] bg-red-50/50 py-1.5 rounded-lg border border-red-100 uppercase tracking-widest w-full group-hover:bg-red-50 transition-colors">
                         <XCircle className="w-3.5 h-3.5" />
                         {tx.status}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
