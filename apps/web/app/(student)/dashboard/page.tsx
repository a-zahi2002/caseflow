import { Flame, Trophy, Play, CheckCircle2, TrendingUp, Clock, Calendar } from 'lucide-react'
import { StatCard } from '@/components/dashboard-stats'
import { CaseCard } from '@/components/case-card'

export default function StudentDashboard() {
  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Dr. Sarah!</h1>
          <p className="text-gray-500 mt-1">You have <span className="font-bold text-primary">3 active cases</span> to complete this week.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Current Streak</p>
            <p className="text-lg font-bold text-foreground font-mono leading-none">12 Days</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Cases"
          value={48}
          subValue="Completed so far"
          icon={CheckCircle2}
          trend={{ value: "12%", positive: true }}
        />
        <StatCard 
          label="Avg. Accuracy"
          value="92%"
          subValue="Case diagnostic score"
          icon={TrendingUp}
          trend={{ value: "4.5%", positive: true }}
        />
        <StatCard 
          label="Learning Hours"
          value="156h"
          subValue="Time spent in simulation"
          icon={Clock}
        />
        <StatCard 
          label="Current Rank"
          value="#42"
          subValue="Top 5% of class"
          icon={Trophy}
        />
      </div>

      {/* Main Content: Recent Activity & Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              Continue Learning
            </h2>
            <button className="text-sm font-semibold text-primary hover:underline">View All Cases</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CaseCard 
              id="c1"
              title="Acute Abdominal Pain in a 45-year-old Female"
              specialty="Gastroenterology"
              difficulty="Intermediate"
              duration="45m"
              progress={65}
              lastActive="2 hours ago"
            />
            <CaseCard 
              id="c2"
              title="Dyspnea and Tachycardia: Post-Operative Complication"
              specialty="Pulmonology"
              difficulty="Advanced"
              duration="60m"
              progress={30}
              lastActive="Yesterday"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Upcoming Assessment
          </h2>
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-border">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Coming Next Monday</p>
              <h4 className="font-bold text-foreground">Clinical Simulation Exam: Endocrine</h4>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-mono">
                   <Clock className="w-3.5 h-3.5" />
                   <span>2:00 PM</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                   <Calendar className="w-3.5 h-3.5" />
                   <span>April 2nd</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg">
               <p className="text-sm text-teal-800 font-medium">Tip: Dr. Sarah, you should review the <span className="font-bold underline cursor-pointer hover:no-underline underline-offset-2">Thyroid Nodule</span> case before the exam.</p>
            </div>
            
            <button className="w-full py-2.5 border-2 border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary/5 transition-colors">
               See Exam Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
