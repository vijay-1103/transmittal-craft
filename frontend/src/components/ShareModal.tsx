import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transmittalTitle: string;
}

export function ShareModal({
  open,
  onOpenChange,
  transmittalTitle,
}: ShareModalProps) {
  const { toast } = useToast();

  const handleShareViaTeams = () => {
    toast({
      title: "Sharing via Teams",
      description: `"${transmittalTitle}" will be shared via Microsoft Teams.`,
    });
    onOpenChange(false);
  };

  const handleShareViaMail = () => {
    toast({
      title: "Sharing via Mail",
      description: `"${transmittalTitle}" will be shared via email.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Transmittal</DialogTitle>
          <DialogDescription>
            Choose how you want to share "{transmittalTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleShareViaTeams}
          >
            <MessageSquare className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Share via Microsoft Teams</div>
              <div className="text-xs text-muted-foreground">
                Send this transmittal through Teams
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleShareViaMail}
          >
            <Mail className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Share via Email</div>
              <div className="text-xs text-muted-foreground">
                Send this transmittal through email
              </div>
            </div>
          </Button>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
