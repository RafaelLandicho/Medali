"use client";

import {
  LogOut,
  Home,
  Users,
  BarChart3,
  FileText,
  Pill,
  UserCircle,
  Shield,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/auth/authprovider";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: "Home",
    icon: Home,
    items: [{ label: "Dashboard", path: "/" }],
  },
  {
    label: "Records",
    icon: FileText,
    items: [
      { label: "View Records", path: "/records" },
      { label: "Add Record", path: "/add-record" },
    ],
  },
  {
    label: "Prescriptions",
    icon: Pill,
    items: [{ label: "View Prescriptions", path: "/prescriptions" }],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    items: [{ label: "Dashboard", path: "/analytics" }],
  },
  {
    label: "Users",
    icon: Users,
    items: [{ label: "View All Users", path: "/users" }],
  },
  {
    label: "Admin",
    icon: Shield,
    items: [
      { label: "Manage Logs", path: "/logs" },
      { label: "Manage Users", path: "/users" },
    ],
  },
];

// ─── Desktop nav item ─────────────────────────────────────────────────────────

const NavItem = ({
  item,
  isActive,
}: {
  item: (typeof NAV_ITEMS)[0];
  isActive: boolean;
}) => {
  const navigate = useNavigate();
  const Icon = item.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`
            inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-150
            ${
              isActive
                ? "bg-white text-[#00a896]"
                : "text-white/90 hover:bg-white/15 hover:text-white"
            }
          `}
        >
          <Icon className="w-4 h-4" />
          {item.label}
          {item.items.length > 1 && (
            <ChevronDown className="w-3 h-3 opacity-60" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 mt-1">
        {item.items.map((sub) => (
          <DropdownMenuItem
            key={sub.path}
            onClick={() => navigate(sub.path)}
            className="text-sm"
          >
            {sub.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function HeaderPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isAdmin = user?.type?.toLowerCase() === "admin";
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [expandedMobileNav, setExpandedMobileNav] = React.useState<
    string | null
  >(null);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedMobileNav(null);
  }, [location.pathname]);

  const isActive = (item: (typeof NAV_ITEMS)[0]) =>
    item.items.some((sub) => sub.path === location.pathname);

  return (
    <>
      <header className="w-full bg-[#1a1a2e] text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <div className="bg-[#00a896] text-white w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm">
              🩺
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                meda<span className="text-[#00c4b4]">li</span>
              </h1>
              <p className="text-[10px] text-white/50 tracking-wide leading-none mt-0.5">
                Medical Records Platform
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          {!isMobile && (
            <nav className="flex items-center gap-0.5">
              {NAV_ITEMS.filter(
                (item) => item.label !== "Admin" || isAdmin,
              ).map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  isActive={isActive(item)}
                />
              ))}
            </nav>
          )}
          {isAdmin && (
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Button
                        onClick={() => {
                          navigate("/logs");
                        }}
                      >
                        Manage Logs and Users
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuTrigger>
              </DropdownMenu>
            </div>
          )}

          {/* Right: user area + mobile hamburger */}
          <div className="flex items-center gap-2">
            {/* User dropdown — always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Avatar className="w-8 h-8 border-2 border-[#00a896]">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}${user?.lastName}`}
                    />
                    <AvatarFallback className="bg-[#00a896] text-white text-xs font-bold">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <div className="text-left">
                      <p className="text-sm font-semibold leading-none text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[11px] text-white/50 mt-0.5 leading-none">
                        {user?.type?.toUpperCase()}
                      </p>
                    </div>
                  )}
                  {!isMobile && (
                    <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                {/* Mini profile header in dropdown */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.type?.toUpperCase()}
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${user?.uid}`)}
                  className="mt-1"
                >
                  <UserCircle className="w-4 h-4 mr-2 text-gray-400" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/edit-profile")}>
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav drawer */}
        {isMobile && mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#1a1a2e] px-4 pb-4 pt-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const expanded = expandedMobileNav === item.label;
              const active = isActive(item);

              return (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      item.items.length === 1
                        ? navigate(item.items[0].path)
                        : setExpandedMobileNav(expanded ? null : item.label)
                    }
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium my-0.5
                      transition-colors
                      ${
                        active
                          ? "bg-[#00a896]/20 text-[#00a896]"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    {item.items.length > 1 && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Sub-items */}
                  {expanded && item.items.length > 1 && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {item.items.map((sub) => (
                        <button
                          key={sub.path}
                          onClick={() => navigate(sub.path)}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                            ${
                              location.pathname === sub.path
                                ? "text-[#00a896] font-medium"
                                : "text-white/60 hover:text-white hover:bg-white/10"
                            }
                          `}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
}
