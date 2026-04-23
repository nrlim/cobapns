import { Calendar, Download, Users, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
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
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 mt-1 tracking-tight">Rp 142.8M</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-brand-blue-deep font-black text-xs rounded-full">+12.5%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">vs last month</span>
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
              <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">1,284</h3>
            </div>
          <div className="mt-8 space-y-4 w-full">
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-brand-blue-deep">Elite Plan</span>
                <span className="text-slate-500">720 (56%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-blue h-full rounded-full w-[56%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-slate-600">Master Plan</span>
                <span className="text-slate-500">564 (44%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full w-[44%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="md:col-span-1 lg:col-span-1 bg-white rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between items-center border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider w-full text-left">Conversion</p>
          <div className="flex flex-col items-center justify-center py-4 relative my-auto">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle className="text-slate-100" cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" strokeWidth="10"></circle>
              <circle 
                className="text-amber-500 drop-shadow-md" 
                cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" 
                strokeDasharray="226.19" strokeDashoffset="194.5" strokeLinecap="round" strokeWidth="10"
              ></circle>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-slate-900">14%</span>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider w-full">Goal: 15.0%</p>
        </div>

        {/* Active Exams Card */}
        <div className="md:col-span-1 lg:col-span-1 bg-brand-blue-deep rounded-[1.5rem] p-6 shadow-md flex flex-col justify-between text-white border border-brand-blue-deep relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-sm font-bold text-blue-200 uppercase tracking-wider relative z-10 w-full text-left">Active Exams</p>
          <div className="relative z-10 mt-auto">
            <h3 className="text-4xl font-black text-white mt-1 tracking-tight">42</h3>
            <div className="mt-3 text-[11px] font-bold text-blue-300 flex items-center gap-1.5 bg-blue-900/50 w-max px-2.5 py-1 rounded-full uppercase tracking-wider">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              Live Now
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Area Chart Section */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Growth Curve</h3>
            <p className="text-sm text-slate-500 font-medium">Daily transaction volume trends for the past 30 days</p>
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            <button className="px-4 py-1.5 text-xs font-black bg-white text-brand-blue-deep rounded-lg shadow-sm uppercase tracking-wider transition-colors">Revenue</button>
            <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider rounded-lg">Signups</button>
          </div>
        </div>
        
        {/* SVG Area Chart */}
        <div className="w-full h-64 relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
            <defs>
              <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(13, 148, 136, 0.4)', stopOpacity: 1 }}></stop>
                <stop offset="100%" style={{ stopColor: 'rgba(13, 148, 136, 0)', stopOpacity: 1 }}></stop>
              </linearGradient>
            </defs>
            {/* Horizontal Grid lines */}
            <line stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6 6" x1="0" x2="1000" y1="50" y2="50"></line>
            <line stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6 6" x1="0" x2="1000" y1="100" y2="100"></line>
            <line stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6 6" x1="0" x2="1000" y1="150" y2="150"></line>
            
            {/* Area Path */}
            <path d="M0,180 Q100,160 200,170 T400,120 T600,140 T800,80 T1000,60 L1000,200 L0,200 Z" fill="url(#chartGradient)"></path>
            
            {/* Stroke Path */}
            <path d="M0,180 Q100,160 200,170 T400,120 T600,140 T800,80 T1000,60" fill="none" stroke="#1E73BE" strokeLinecap="round" strokeWidth="4"></path>
            
            {/* Key data points */}
            {[
              { cx: 200, cy: 170 },
              { cx: 400, cy: 120 },
              { cx: 600, cy: 140 },
              { cx: 800, cy: 80 },
              { cx: 1000, cy: 60 },
            ].map((pt, i) => (
              <circle key={i} cx={pt.cx} cy={pt.cy} fill="white" r="6" stroke="#1E73BE" strokeWidth="3.5" className="hover:r-[8px] cursor-crosshair transition-all"></circle>
            ))}
          </svg>
          
          {/* Chart Labels */}
          <div className="flex justify-between mt-6 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>01 Oct</span>
            <span>07 Oct</span>
            <span>14 Oct</span>
            <span>21 Oct</span>
            <span>28 Oct</span>
            <span className="text-brand-blue-deep bg-blue-50 px-2 py-0.5 rounded">Current</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h3>
          <a className="text-xs font-black uppercase text-brand-blue-deep hover:text-brand-blue-deep bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors tracking-widest" href="#">View All Activity</a>
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
              {[
                { name: "Sarah Jenkins", email: "sarah.j@example.com", plan: "Elite Package", color: "teal", price: "Rp 450,000", date: "Oct 24, 2023", initial: "S" },
                { name: "Marcus Lingga", email: "m.lingga@corp.id", plan: "Master Plan", color: "slate", price: "Rp 299,000", date: "Oct 24, 2023", initial: "M" },
                { name: "Budi Hartono", email: "budi.h@domain.com", plan: "Elite Package", color: "teal", price: "Rp 450,000", date: "Oct 23, 2023", initial: "B" },
                { name: "Diana Rachim", email: "diana.r@edu.web.id", plan: "Master Plan", color: "slate", price: "Rp 299,000", date: "Oct 23, 2023", initial: "D" },
                { name: "Rizky Fauzi", email: "rizky.f@gmail.com", plan: "Elite Package", color: "teal", price: "Rp 450,000", date: "Oct 22, 2023", initial: "R" },
              ].map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-inner
                         ${tx.color === "teal" ? "bg-brand-blue-deep" : "bg-slate-600"}`}>
                        {tx.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue-deep transition-colors">{tx.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{tx.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-widest
                      ${tx.color === "teal" ? "bg-blue-50 text-brand-blue-deep border border-blue-100" : "bg-slate-100 text-slate-700 border border-slate-200"}
                    `}>
                      {tx.plan}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-slate-900 tracking-tight">{tx.price}</td>
                  <td className="px-6 py-5 text-xs font-semibold text-slate-500">{tx.date}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-1.5 text-brand-blue font-bold text-[10px] bg-blue-50/50 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest w-full group-hover:bg-blue-50 transition-colors">
                       <CheckCircle2 className="w-3.5 h-3.5" />
                       Success
                    </div>
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
