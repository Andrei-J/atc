import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';
import { PlaneFillIcon } from "@/components/shadcn-icons/akar-icons-plane-fill";
import { FolderIcon } from "@/components/shadcn-icons/akar-icons-folder";
import { LayoutDashboard,CheckCircle, XCircle, AlertTriangle } from "lucide-react";
const mainNavItems: NavItem[] = [
    {
        title: 'Flights Status',
        href: '/FlightStatus/Index',
        icon: PlaneFillIcon as any,
    },
    {
        title: 'Airport Status',
        href: '/AirportStatus/Index',
        icon: CheckCircle,
    },
    {
        title: 'Notams',
        href: '/notams/',
        icon: FolderIcon as any,
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    }
    
];

const footerNavItems: NavItem[] = [
   
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
