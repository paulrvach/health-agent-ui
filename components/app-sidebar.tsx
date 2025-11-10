"use client"

import * as React from "react"
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  Dumbbell,
  Heart,
  Settings,
  TrendingUp,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Athlete",
    email: "athlete@fitness.app",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Activity,
    },
    {
      title: "AI Coach",
      url: "/coach",
      icon: Brain,
    },
    {
      title: "Workouts",
      url: "#",
      icon: Dumbbell,
    },
    {
      title: "Progress",
      url: "#",
      icon: TrendingUp,
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ 
  onQuickAction,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  onQuickAction?: () => void
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Heart className="!size-5" style={{ color: 'hsl(var(--primary))' }} />
                <span className="text-base font-semibold">Health Agent</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onQuickAction={onQuickAction} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

