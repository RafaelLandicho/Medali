"use client";

import {
  LogOut,
  Home,
  Users,
  BarChart3,
  FileText,
  Pill,
  UserCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/auth/authprovider";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HeaderPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-gradient-to-r from-[#00a896] to-[#02c39a] text-white shadow-lg">
      <div className="flex items-center justify-between px-8 py-4">
        {/* ================= LOGO ================= */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="bg-white text-[#00a896] p-2 rounded-xl text-xl">
            🩺
          </div>

          <div>
            <h1 className="font-bold text-2xl tracking-wide">MEDALI</h1>
            <p className="text-xs text-white/80"> A Medical Records Platform</p>
          </div>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="hidden lg:flex items-center gap-2">
          {/* HOME */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="!bg-white !text-black ">
                <Home className="w-4 h-4 mr-2" />
                HOME
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/")}>
                Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* RECORDS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="!bg-white !text-black ">
                <FileText className="w-4 h-4 mr-2" />
                RECORDS
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/records")}>
                  View Records
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/add-record")}>
                  Add Record
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* PRESCRIPTIONS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="!bg-white !text-black ">
                <Pill className="w-4 h-4 mr-2" />
                PRESCRIPTIONS
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/prescriptions")}>
                View Prescriptions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ANALYTICS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="!bg-white !text-black ">
                <BarChart3 className="w-4 h-4 mr-2" />
                ANALYTICS
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/analytics")}>
                Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* USERS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="!bg-white !text-black ">
                <Users className="w-4 h-4 mr-2" />
                USERS
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/users")}>
                View All Users
              </DropdownMenuItem>

              {/* <DropdownMenuItem onClick={() => navigate("/users/doctors")}>
                View Doctors
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/users/secretaries")}>
                View Secretaries
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* ================= USER AREA ================= */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                  flex items-center gap-3
                  !bg-white
                  !text-black
                  px-3 py-2
                  rounded-full
                  transition
                "
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={UserCircle + `${user?.uid}`} />
                  <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
                </Avatar>

                <div className="text-left hidden md:block">
                  <p className="font-medium leading-none">
                    Dr. {user?.firstName}
                  </p>

                  <p className="text-xs text-black">
                    {user?.type?.toLocaleUpperCase()}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => navigate(`/profile/${user?.uid}`)}
              >
                View Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/edit-profile")}>
                Edit Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={logout} className="text-red-500">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
