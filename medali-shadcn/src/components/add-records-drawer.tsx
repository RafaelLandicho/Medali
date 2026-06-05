"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { AddRecords } from "./add-records";

export function AddRecordsDrawer() {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Desktop view (Dialog)
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="!bg-green-300 !text-black">
            Add Records
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[90vw] sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Medical Record</DialogTitle>
            <DialogDescription>
              Create a medical record for your patient. Click save when you’re
              done.
            </DialogDescription>
          </DialogHeader>

          <AddRecords />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="!bg-green-300 !text-black">
          Add Records
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Medical Record</DrawerTitle>
          <DrawerDescription>
            Create a medical record for your patient. Click save when you’re
            done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <AddRecords />
        </div>

        <DrawerFooter className="border-t mt-4">
          <DrawerClose asChild>
            <Button className="!bg-red-400 !text-white" variant="destructive">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
