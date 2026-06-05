"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Patient } from "./medical_records";
import { ViewFullPatient } from "./view-full-records";

type FullRecordsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

export function FullRecordsDrawer({
  open,
  onOpenChange,
  patient: patient,
}: FullRecordsDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[98vw] !max-w-[1000px] !h-[95vh] !overflow-hidden">
        <DialogHeader>
          <DialogTitle>Full Patient Details</DialogTitle>
        </DialogHeader>
        <ViewFullPatient
          open={open}
          onOpenChange={onOpenChange}
          patient={patient}
        />
      </DialogContent>
    </Dialog>
  );
}
