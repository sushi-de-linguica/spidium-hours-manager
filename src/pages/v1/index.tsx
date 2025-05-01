import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { useProtocolData } from "@/hooks/use-protocol-data";
import { Status } from "./status";
import { Link, useLocation } from "react-router";
import { useIntegrations } from "@/hooks/use-integrations";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  useProtocolData();
  const { testAllConnections } = useIntegrations();

  useEffect(() => {
    testAllConnections();
  }, [])

  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex justify-between pr-4 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {pathname != "/" && (
              <>
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        <Link to="/">Voltar ao Dashboard</Link>
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            )}
          </div>
          <div className="flex items-center">
            <Status />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
