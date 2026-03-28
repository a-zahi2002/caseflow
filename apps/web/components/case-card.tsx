import { LucideIcon, BookOpen, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CaseCardProps {
  id: string
  title: string
  specialty: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  progress?: number
  lastActive: string
}

const difficultyColors = {
  Beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  Advanced: "bg-red-100 text-red-800 border-red-200"
}

export function CaseCard({ id, title, specialty, difficulty, duration, progress = 0, lastActive }: CaseCardProps) {
  return (
    <div className="group bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            {specialty}
          </span>
          <span className={cn(
             "text-[10px] font-bold px-2 py-0.5 rounded-full border",
             difficultyColors[difficulty]
          )}>
            {difficulty}
          </span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Case</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Progress</span>
            <span className="font-bold text-foreground font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
        {progress > 0 ? 'Continue Case' : 'Start Case'}
        <ChevronRight className="w-4 h-4" />
      </button>
      
      <p className="mt-4 text-[10px] text-gray-400 text-center italic">
        Last active: {lastActive}
      </p>
    </div>
  )
}
