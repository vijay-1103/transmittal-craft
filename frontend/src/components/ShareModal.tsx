import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transmittalTitle: string;
}

export function ShareModal({ open, onOpenChange, transmittalTitle }: ShareModalProps) {
  const handleShareTeams = () => {
    // Mock Teams share functionality
    console.log("Sharing via Teams:", transmittalTitle);
    onOpenChange(false);
  };

  const handleShareEmail = () => {
    // Mock Email share functionality
    console.log("Sharing via Email:", transmittalTitle);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Transmittal</DialogTitle>
          <DialogDescription>
            How would you like to share "{transmittalTitle}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleShareTeams}
          >
            <MessageSquare className="mr-3 h-5 w-5" />
            Share via Teams
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleShareEmail}
          >
            <Mail className="mr-3 h-5 w-5" />
            Share via Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}