"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/authprovider";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { FiUsers, FiHome, FiUser, FiBarChart2, FiLogOut } from "react-icons/fi";

export function NavigationMenuDemo() {
  const { logout, user } = useAuth();

  return (
    <NavigationMenu
      viewport={false}
      className="!w-full !flex !justify-center !relative z-[50]"
    >
      <NavigationMenuList className="flex justify-center gap-6">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-gradient-to-r from-green-400 to-green-500 text-black px-4 py-2 rounded-lg shadow-md hover:from-green-500 hover:to-green-600 transition font-semibold">
            <FiHome className="inline mr-2" /> Home
          </NavigationMenuTrigger>
          <NavigationMenuContent className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg p-4 w-[400px]">
            <ul className="grid gap-3">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/records"
                    className="flex flex-col p-3 rounded-lg hover:bg-green-50 transition text-black"
                  >
                    <div className="font-semibold flex items-center gap-2">
                      <FiBarChart2 /> Medical Records
                    </div>
                    <div className="text-sm text-gray-600">
                      View your stored medical records
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/prescriptions"
                    className="flex flex-col p-3 rounded-lg hover:bg-green-50 transition text-black"
                  >
                    <div className="font-semibold flex items-center gap-2">
                      <FiBarChart2 /> Medical Prescriptions
                    </div>
                    <div className="text-sm text-gray-600">
                      View your stored medical prescriptions
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/analytics"
                    className="flex flex-col p-3 rounded-lg hover:bg-green-50 transition text-black"
                  >
                    <div className="font-semibold flex items-center gap-2">
                      <FiBarChart2 /> Record Reports
                    </div>
                    <div className="text-sm text-gray-600">
                      View analytics of records and prescriptions
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-gradient-to-r from-green-400 to-green-500 text-black px-4 py-2 rounded-lg shadow-md hover:from-green-500 hover:to-green-600 transition font-semibold">
            <FiUsers className="inline mr-2" /> Users
          </NavigationMenuTrigger>
          <NavigationMenuContent className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg p-4 w-[300px]">
            <ul className="grid gap-3">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/users"
                    className="flex flex-col p-3 rounded-lg hover:bg-green-50 transition text-black"
                  >
                    <div className="font-semibold flex items-center gap-2">
                      <FiUsers /> Current Users
                    </div>
                    <div className="text-sm text-gray-600">
                      View all current users
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-gradient-to-r from-green-400 to-green-500 text-black px-4 py-2 rounded-lg shadow-md hover:from-green-500 hover:to-green-600 transition font-semibold">
            <FiUser className="inline mr-2" /> Profile
          </NavigationMenuTrigger>
          <NavigationMenuContent className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg p-4 w-[250px]">
            <ul className="grid gap-3">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    to="/profile"
                    className="flex flex-col p-3 rounded-lg hover:bg-green-50 transition text-black"
                  >
                    View Profile
                    <div className="text-sm text-gray-600">
                      View your profile
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              {user?.type === "admin" && (
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/logs"
                      className="flex flex-col p-3 rounded-lg hover:bg-green-50 transition text-black"
                    >
                      View Logs
                      <div className="text-sm text-gray-600">
                        View website logs
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              )}
              <li>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-white !bg-red-400 rounded-lg hover:bg-red-100 transition w-full font-semibold"
                >
                  <FiLogOut className="!bg-red-100 text-white" /> Logout
                </button>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
