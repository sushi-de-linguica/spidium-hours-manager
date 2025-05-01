"use client";

import * as React from "react";
import {
  BookOpen,
  Lightbulb,
  LucideLayoutDashboard,
  Network,
  Settings as SettingsIcon,
  FileText,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import HeaderImage from "/icon-144x144.png?url";

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
      isActive: false,
      items: [
        {
          title: "Gerenciar eventos",
          url: "/events",
        },
        {
          title: "Gerenciar membros",
          url: "/events/members",
        },
      ],
    },
    {
      title: "Integrações",
      url: "#",
      icon: Network,
      isActive: false,
      items: [
        {
          title: "Nightbot",
          url: "/settings/integration/nightbot",
        },
        {
          title: "OBS",
          url: "/settings/integration/obs",
        },
        {
          title: "Twitch",
          url: "/settings/integration/twitch",
        },
      ],
    },

    {
      title: "Configurações",
      url: "#",
      icon: SettingsIcon,
      isActive: false,
      items: [
        {
          title: "Título da live",
          url: "/settings/title",
        },
        {
          title: "Botões de ação",
          url: "/settings/action-buttons",
        },
        {
          title: "Arquivos",
          url: "/settings/files",
        },
        {
          title: "Atualizações",
          url: "/settings/update",
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
