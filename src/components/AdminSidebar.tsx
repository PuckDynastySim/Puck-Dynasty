import { useState } from "react";
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Calendar,
  Play,
  Settings,
  Shield,
  FileText,
  Zap,
  Database,
  BarChart3,
  History
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Shield, description: "Overview & Quick Actions" },
  { title: "League Settings", url: "/admin/leagues/new", icon: Settings, description: "Configure League Parameters" },
  { title: "Team Management", url: "/admin/teams", icon: Trophy, description: "Create & Manage Teams" },
  { title: "Player Generator", url: "/admin/players/generate", icon: Users, description: "Generate Fictional Players" },
  { title: "Coach Generator", url: "/admin/coaches", icon: UserPlus, description: "Create Coaching Staff" },
  { title: "Schedule Builder", url: "/admin/schedule/builder", icon: Calendar, description: "Build Game Schedules" },
  { title: "Simulation Engine", url: "/admin/simulation", icon: Play, description: "Run Game Simulations" },
  { title: "User Management", url: "/admin/users", icon: Database, description: "Manage GMs & Users" },
  { title: "Reports & Stats", url: "/admin/reports", icon: FileText, description: "League Analytics" },
  { title: "League Stats", url: "/league-stats", icon: BarChart3, description: "View Current Season Statistics" },
  { title: "League History", url: "/league-history", icon: History, description: "Browse Historical Records" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    return isActive(path) 
      ? "bg-primary/10 text-primary border-primary/20 border-l-4" 
      : "hover:bg-muted/50 transition-all duration-200";
  };

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-72"}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">Hockey Sim</h2>
                <p className="text-sm text-sidebar-foreground/70">Admin Control</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-sidebar-foreground/60 font-semibold mb-2"}>
            Admin Tools
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClasses(item.url)} flex items-center gap-3 p-3 rounded-lg group`}
                      title={collapsed ? `${item.title} - ${item.description}` : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sidebar Toggle at Bottom */}
        <div className="mt-auto p-3 border-t border-sidebar-border">
          <SidebarTrigger className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent transition-colors" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}