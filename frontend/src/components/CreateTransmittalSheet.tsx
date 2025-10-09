import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateTransmittalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDocumentLibrary: () => void;
  editData?: any;
}

export function CreateTransmittalSheet({
  open,
  onOpenChange,
  onOpenDocumentLibrary,
  editData,
}: CreateTransmittalSheetProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: editData?.title || "",
    projectName: editData?.projectName || "",
    recipient: editData?.recipient || "",
    recipientEmail: editData?.recipientEmail || "",
    purpose: editData?.purpose || "",
    remarks: editData?.remarks || "",
  });

  const [selectedDocuments, setSelectedDocuments] = useState<any[]>(
    editData?.documents || []
  );

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your transmittal has been saved as a draft.",
    });
    onOpenChange(false);
  };

  const handleGenerate = () => {
    if (!formData.title || selectedDocuments.length === 0) {
      toast({
        title: "Incomplete information",
        description: "Please provide a title and add at least one document.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Transmittal generated",
      description: "Your transmittal has been generated successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editData ? "Edit Transmittal" : "Create New Transmittal"}
          </SheetTitle>
          <SheetDescription>
            Fill in the details below to create your transmittal
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground">
              Basic Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Transmittal Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Architectural Drawings - Rev A"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project Name</Label>
              <Input
                id="project"
                placeholder="e.g., Hospital Wing Extension"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Reason for this transmittal"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Document Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">
                Documents *
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenDocumentLibrary}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Documents
              </Button>
            </div>

            {selectedDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-sm">No documents added yet</p>
                <p className="text-xs mt-1">
                  Click "Add Documents" to select from library
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rev: {doc.revision}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedDocuments(
                          selectedDocuments.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Send Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-foreground">
              Send Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Name</Label>
              <Input
                id="recipient"
                placeholder="e.g., John Smith"
                value={formData.recipient}
                onChange={(e) =>
                  setFormData({ ...formData, recipient: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john@example.com"
                value={formData.recipientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, recipientEmail: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Additional notes or instructions"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleSaveDraft} className="flex-1">
            Save as Draft
          </Button>
          <Button onClick={handleGenerate} className="flex-1">
            Generate Transmittal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
