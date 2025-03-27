"use client";

import * as React from "react";
import { BookOpen, Lightbulb, LucideLayoutDashboard } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import HeaderImage from "/icon-144x144.png?url";
import { Settings } from "@mui/icons-material";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LucideLayoutDashboard,
      isActive: true,
    },
    {
      title: "Eventos",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Gerenciar eventos",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: Settings,
      isActive: true,
      items: [
        {
          title: "Twitch",
          url: "/settings/integration/twitch",
        },
        {
          title: "Nightbot",
          url: "/settings/integration/nightbot",
        },
        {
          title: "OBS",
          url: "/settings/integration/obs",
        },
        {
          title: "Old Times",
          url: "/old-times",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const toggleTheme = () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : ""
    );
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex w-full items-center justify-start gap-2">
          <img className="h-8 w-8" src={HeaderImage} />
          <div className="flex flex-col text-wrap group-data-[collapsible=icon]:hidden">
            <strong>Spidium Hours Manager</strong>
            <div className="flex flex-row gap-2 items-center justify-start">
              <small>v1.0.0</small>
              <Lightbulb
                className="w-3 h-3 hover:cursor-pointer"
                onClick={toggleTheme}
              />
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
