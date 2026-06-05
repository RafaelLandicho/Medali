"use client";

import { useState } from "react";
import {
  Home,
  User,
  SearchIcon,
  FilePenIcon,
  FilePlusIcon,
  ClipboardClockIcon,
  ChartBarIncreasingIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

import quickButton from "./images/quick.png";
const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Records", url: "/records", icon: SearchIcon },
  { title: "Pending", url: "/pending", icon: ClipboardClockIcon },
  { title: "Add Record", url: "/add-record", icon: FilePlusIcon },
  { title: "Prescriptions", url: "/prescriptions", icon: FilePenIcon },
  { title: "Users", url: "/users", icon: User },
  { title: "Analytics", url: "/analytics", icon: ChartBarIncreasingIcon },
];

export function QuickTool() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    x: 16,
    y: 120,
  });

  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();

  return (
    <div
      className="fixed z-[999999]"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => {
        setIsDragging(true);

        const startX = e.clientX - position.x;
        const startY = e.clientY - position.y;

        const move = (ev: MouseEvent) => {
          setPosition({
            x: ev.clientX - startX,
            y: ev.clientY - startY,
          });
        };

        const up = () => {
          setIsDragging(false);
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
        };

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }}
    >
      <div className="relative">
        {/* Floating Button */}
        <Button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full !bg-white text-black shadow-lg flex items-center justify-center hover:scale-105 transition"
        >
          <img src={quickButton} className="rounded-2xl " />
        </Button>

        {/* Panel */}
        {open && (
          <div className="absolute left-0 mt-3 w-64 bg-white rounded-xl shadow-xl border p-2 space-y-1">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(item.url)}
                  className="flex items-center !bg-white text-black gap-3 w-full px-3 py-2 rounded-lg text-sm text-left "
                >
                  <Icon className="w-4 h-4 text-gray-600" />
                  {item.title}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
