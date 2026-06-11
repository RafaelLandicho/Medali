"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import type { Prescription } from "./view-prescriptions";
import { EditPrescription } from "./edit-prescription";

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
        {/* h-[92vh] caps the drawer height; flex+overflow lets the inner form scroll */}
        <DrawerContent className="h-[92vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Edit Prescription</DrawerTitle>
            <DrawerDescription>
              Edit your patient&apos;s prescription. Click save when you&apos;re
              done.
            </DrawerDescription>
          </DrawerHeader>

          {/* This div grows to fill remaining height and scrolls */}
          <div className="flex-1 overflow-y-auto px-4 pb-2">
            <EditPrescription
              open={open}
              onOpenChange={onOpenChange}
              prescription={prescription}
            />
          </div>

          <DrawerFooter className="flex-shrink-0">
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
      {/* max-w-4xl for a comfortable wide layout; max-h+overflow for scroll */}
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Prescription</DialogTitle>
          <DialogDescription>
            Edit your patient&apos;s prescription. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <EditPrescription
          open={open}
          onOpenChange={onOpenChange}
          prescription={prescription}
        />
      </DialogContent>
    </Dialog>
  );
}
