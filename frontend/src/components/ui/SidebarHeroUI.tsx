// components/dashboard/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import NavLogo from "@/components/ui/NavLogo";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Listbox,
  ListboxItem,
  Divider,
  Drawer,
  DrawerContent,
  DrawerBody,
  useDisclosure,
  Skeleton,
} from "@heroui/react";
import {
  IconChartBar,
  IconFileText,
  IconBulb,
  IconKey,
  IconSettings,
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconWorld,
  IconLock,
} from "@tabler/icons-react";

interface SidebarProps {
  selectedProject: string | null;
  onProjectChange: (url: string) => void;
}

export default function Sidebar({
  selectedProject,
  onProjectChange,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const { projects, isLoadingProjects } = useDashboard();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const isLoadingUser = !user;

  // Drawer control for mobile
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    {
      id: "dashboard",
      label: "SEO Dashboard",
      icon: IconChartBar,
      path: "/dashboard",
      description: "View your SEO metrics",
    },
    {
      id: "content",
      label: "Content",
      icon: IconFileText,
      path: "/dashboard/content",
      description: "Manage your content",
    },
    {
      id: "optimization",
      label: "Optimization Ideas",
      icon: IconBulb,
      path: "/dashboard/optimization",
      description: "Get optimization tips",
    },
    {
      id: "keywords",
      label: "Keywords",
      icon: IconKey,
      path: "/dashboard/keywords",
      description: "Keyword research",
    },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getProjectDisplayName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.slice(0, 2).toUpperCase();
  };

  // Sidebar content JSX (reused in desktop and mobile drawer)
  const renderSidebarContent = (onItemClick?: () => void) => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 ">
        <NavLogo
          variant="compact"
          color="white"
          size="custom"
          customWidth={80}
          customHeight={80}
          showText={true}
          animate={true}
          responsive={false}
        />
      </div>

      <Divider />

      {/* Project Selector */}
      <div className="px-4 py-4">
        {isLoadingProjects ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-3 w-3/4 rounded-lg" />
          </div>
        ) : (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                className="w-full justify-between bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600"
                endContent={
                  <IconChevronDown size={16} className="text-neutral-500" />
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconWorld
                    size={18}
                    className="shrink-0 text-primary-600 dark:text-primary-400"
                  />
                  <div className="text-left truncate">
                    <div className="text-[10px] leading-tight text-neutral-500 dark:text-neutral-400  tracking-wide">
                      Project
                    </div>
                    <div className="text-sm font-semibold truncate text-neutral-900 dark:text-white">
                      {selectedProject
                        ? getProjectDisplayName(selectedProject)
                        : "Select project"}
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Project selection"
              selectionMode="single"
              selectedKeys={selectedProject ? [selectedProject] : []}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as string;
                if (key) onProjectChange(key);
              }}
            >
              {projects.length > 0 ? (
                projects.map((project) => (
                  <DropdownItem key={project.url}>
                    {getProjectDisplayName(project.url)}
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem key="no-projects" isReadOnly>
                  No projects yet
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4">
        {isLoadingProjects ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <Listbox
            disabledKeys={[
              "content",
              "audit",
              "optimization",
              "competitor",
              "keywords",
            ]}
            aria-label="Navigation menu"
            variant="flat"
            selectionMode="single"
            selectedKeys={[pathname]}
            onSelectionChange={(keys) => {
              const path = Array.from(keys)[0] as string;
              const disabledPaths = [
                "/dashboard/content",
                "/dashboard/audit",
                "/dashboard/optimization",
                "/dashboard/competitor",
                "/dashboard/keywords",
              ];

              if (path && !disabledPaths.includes(path)) {
                handleNavClick(path);
                onItemClick?.();
              }
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              const isDisabled = [
                "content",
                "audit",
                "optimization",
                "competitor",
                "keywords",
              ].includes(item.id);

              return (
                <ListboxItem
                  key={item.path}
                  startContent={
                    <div className="relative">
                      <Icon
                        size={20}
                        className={`${
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : isDisabled
                            ? "text-neutral-400 dark:text-neutral-600"
                            : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      />
                      {isDisabled && (
                        <IconLock
                          size={12}
                          className="absolute -bottom-1 -right-1 text-amber-500"
                        />
                      )}
                    </div>
                  }
                  description={isDisabled ? "Coming Soon" : item.description}
                  className={`${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-950/30 rounded-lg mb-1"
                      : isDisabled
                      ? "mb-1 opacity-60 cursor-not-allowed rounded-lg"
                      : "mb-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  }`}
                  classNames={{
                    title: `${
                      isActive
                        ? "text-primary-700 dark:text-primary-300 font-semibold"
                        : isDisabled
                        ? "text-neutral-500 dark:text-neutral-500 font-medium"
                        : "text-neutral-700 dark:text-neutral-200"
                    }`,
                    description: `text-xs ${
                      isDisabled
                        ? "text-amber-600 dark:text-amber-400 font-semibold"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`,
                  }}
                >
                  {item.label}
                </ListboxItem>
              );
            })}
          </Listbox>
        )}
      </nav>

      <Divider className="my-2" />

      {/* User Profile with Popover */}
      <div className="px-3 pb-4 pt-4">
        {isLoadingUser ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="solid"
                className="w-full justify-start py-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar
                    name={getUserInitials()}
                    size="sm"
                    className="shrink-0"
                    classNames={{
                      base: "bg-primary-600 dark:bg-primary-500",
                      name: "text-white font-semibold",
                    }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold truncate text-neutral-900 dark:text-white">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {user?.email}
                    </div>
                  </div>
                  <IconChevronDown
                    size={16}
                    className="shrink-0 text-neutral-400"
                  />
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <DropdownItem
                key="user-info"
                isReadOnly
                className="py-2 px-2 mb-1 cursor-default"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={getUserInitials()}
                    size="md"
                    classNames={{
                      base: "bg-primary-600 dark:bg-primary-500",
                      name: "text-white font-semibold text-lg",
                    }}
                  />
                  <div>
                    <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </DropdownItem>
              <DropdownItem
                key="settings"
                startContent={<IconSettings size={18} />}
                className="text-neutral-700 dark:text-neutral-200"
                onPress={() => router.push("/dashboard/settings")}
              >
                Account Settings
              </DropdownItem>
              <DropdownItem
                key="logout"
                startContent={<IconLogout size={18} />}
                color="danger"
                className="text-red-600 dark:text-red-400"
                onPress={handleLogout}
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </>
  );

  // Mobile view: Drawer + Hamburger button
  if (isMobile) {
    return (
      <>
        {/* Mobile Header with Menu Button */}
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                onPress={onOpen}
                aria-label="Open menu"
                className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <IconMenu2
                  size={24}
                  className="text-neutral-700 dark:text-neutral-200"
                />
              </Button>
              <NavLogo
                variant="compact"
                color="dark"
                size="sm"
                showText={true}
                animate={true}
                responsive={true}
                textClassName="text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>

            {/* Mobile Avatar */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  name={getUserInitials()}
                  size="sm"
                  isBordered
                  className="cursor-pointer"
                  classNames={{
                    base: "bg-primary-600 dark:bg-primary-500 border-neutral-300 dark:border-neutral-600",
                    name: "text-white font-semibold",
                  }}
                />
              </DropdownTrigger>
              <DropdownMenu className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <DropdownItem
                  key="user-info-mobile"
                  isReadOnly
                  className="py-2 px-2 mb-1 cursor-default"
                >
                  <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user?.email}
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<IconSettings size={18} />}
                  className="text-neutral-700 dark:text-neutral-200"
                  onPress={() => router.push("/dashboard/settings")}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  startContent={<IconLogout size={18} />}
                  color="danger"
                  className="text-red-600 dark:text-red-400"
                  onPress={handleLogout}
                >
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Drawer for Mobile Navigation */}
        <Drawer isOpen={isOpen} onClose={onClose} placement="left" size="xs">
          <DrawerContent>
            <DrawerBody className="p-0">
              {renderSidebarContent(onClose)}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Spacer for fixed header */}
        <div className="h-16 lg:hidden" />
      </>
    );
  }

  // Desktop view: Fixed Sidebar
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:border-r lg:border-neutral-200 dark:lg:border-neutral-700 lg:bg-white dark:lg:bg-neutral-900 lg:z-40 lg:shadow-sm">
      {renderSidebarContent()}
    </aside>
  );
}
