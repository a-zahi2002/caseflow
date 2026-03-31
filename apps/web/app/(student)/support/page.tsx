'use client'

import { HelpCircle, Mail, MessageSquare, BookOpen, ExternalLink, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  const supportCards = [
    {
      icon: <Mail className="text-primary" />,
      title: "Email Support",
      description: "Direct assistance from our clinical support team.",
      action: "Send Ticket"
    },
    {
      icon: <MessageSquare className="text-secondary" />,
      title: "Community Forum",
      description: "Discuss cases with other medical scholars.",
      action: "Visit Forum"
    },
    {
      icon: <BookOpen className="text-emerald-600" />,
      title: "Documentation",
      description: "Comprehensive guides on simulation mechanics.",
      action: "Read Docs"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <header className="mb-12">
        <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-6 shadow-sm">
           <HelpCircle size={28} />
        </div>
        <h1 className="text-4xl font-heading font-black tracking-tight text-on-surface mb-2">Support Center</h1>
        <p className="text-on-surface-variant opacity-70 font-sans font-medium text-lg max-w-2xl">Need assistance with a simulation or have questions about the platform? Our team is here to help you achieve clinical excellence.</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {supportCards.map((card, i) => (
          <div key={i} className="bg-white border border-outline-variant/30 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer">
            <div className="mb-4">{card.icon}</div>
            <h3 className="font-heading font-black text-on-surface mb-1">{card.title}</h3>
            <p className="text-xs text-on-surface-variant opacity-60 leading-relaxed mb-6">{card.description}</p>
            <div className="flex items-center gap-2 text-[10px] font-mono font-black text-primary uppercase tracking-widest group-hover:gap-3 transition-all">
               {card.action}
               <ChevronRight size={12} />
            </div>
          </div>
        ))}
      </div>

      <section className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-md">
           <h2 className="text-2xl font-heading font-black text-on-surface mb-3">Live Simulation Help</h2>
           <p className="text-sm text-on-surface-variant opacity-70 mb-8 font-medium italic">"Encountering a glitch in an active case? Use our priority emergency lane for technical stabilization."</p>
           <button className="px-8 py-3 bg-on-surface text-surface rounded-xl font-heading font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
              <ExternalLink size={14} />
              Open Emergency Support
           </button>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      </section>
    </div>
  )
}
