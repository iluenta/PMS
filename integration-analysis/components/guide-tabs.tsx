"use client"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  icon: string
}

interface GuideTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function GuideTabs({ tabs, activeTab, onTabChange }: GuideTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300",
              )}
            >
              <i className={`${tab.icon} text-lg`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
