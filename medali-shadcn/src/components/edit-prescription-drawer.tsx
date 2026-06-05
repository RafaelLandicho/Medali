"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import type { Prescription } from "./view-prescriptions";
import { EditPrescription } from "./edit-prescription";
import { DialogDescription } from "@radix-ui/react-dialog";

type PrescriptionDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
};

export function PrescriptionDrawer({
  open,
  onOpenChange,
  prescription,
}: PrescriptionDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Prescription</DrawerTitle>
            <DialogDescription>
              Edit you&apos;re patient prescription. Click save when you&apos;re
              done.
            </DialogDescription>
          </DrawerHeader>
          <div className="p-4">
            <EditPrescription
              open={open}
              onOpenChange={onOpenChange}
              prescription={prescription}
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>Edit Prescription</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Edit you&apos;re patient prescription. Click save when you&apos;re
          done.
        </DialogDescription>
        <EditPrescription
          open={open}
          onOpenChange={onOpenChange}
          prescription={prescription}
        />
      </DialogContent>
    </Dialog>
  );
}
