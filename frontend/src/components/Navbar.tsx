"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Divider,
  Tooltip,
} from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function AppNavbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Navbar
      isBordered
      className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm"
      maxWidth="xl"
    >
      {/* Logo on the left */}
      <NavbarBrand>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icons-assets/logo-horizontal-black.svg"
            alt="SiteSage"
            width={160} // 80 for compact
            height={40}
            priority
            className="block dark:hidden"
          />
          <Image
            src="/icons-assets/logo-horizontal-white.svg"
            alt="SiteSage"
            width={160} // 80 for compact
            height={40}
            priority
            className="hidden dark:block"
          />
        </Link>
      </NavbarBrand>

      {/* Right side content */}
      <NavbarContent justify="end">
        {user ? (
          <>
            {/* Dashboard Link */}
            <NavbarItem className="hidden sm:flex">
              <Tooltip
                content="View your analytics dashboard"
                placement="bottom"
              >
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Dashboard
                </Link>
              </Tooltip>
            </NavbarItem>

            {/* User Dropdown */}
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform hover:scale-105"
                    color="primary"
                    name={user.email || "User"}
                    size="sm"
                    src={user.photoURL || undefined}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu actions" variant="flat">
                  <DropdownItem
                    key="profile"
                    className="h-14 gap-2"
                    textValue="Profile"
                  >
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {user.email}
                    </p>
                  </DropdownItem>
                  <DropdownItem
                    key="dashboard"
                    textValue="Dashboard"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    textValue="Settings"
                    onClick={() => router.push("/settings")}
                  >
                    Settings
                  </DropdownItem>
                  <DropdownItem key="divider" textValue="divider">
                    <Divider />
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    textValue="Log Out"
                    onClick={handleLogout}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          </>
        ) : (
          <>
            {/* Sign In Button */}
            <NavbarItem>
              <Tooltip content="Access your account" placement="bottom">
                <Button
                  as={Link}
                  href="/login"
                  variant="light"
                  color="primary"
                  className="text-sm"
                >
                  Sign In
                </Button>
              </Tooltip>
            </NavbarItem>

            {/* Sign Up Button */}
            <NavbarItem>
              <Tooltip content="Create a new account" placement="bottom">
                <Button
                  as={Link}
                  href="/signup"
                  variant="solid"
                  color="primary"
                  className="text-sm"
                >
                  Sign Up
                </Button>
              </Tooltip>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}
