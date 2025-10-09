import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { transmittalApi, type DocumentItem, type TransmittalCreate } from "@/services/transmittalApi";

interface DocumentItem {
  document_no: string;
  title: string;
  revision: number;
  copies: number;
  action: string;
}

interface CreateTransmittalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
  mode?: "create" | "edit" | "view";
}

const transmittalTypes = ["Drawing", "Documents"];
const departments = ["Architecture", "Interior Design", "Engineering", "MEP", "Structural"];
const designStages = ["Conceptual", "Schematic", "Design Development", "Construction Documents"];
const sendToOptions = ["Client", "Contractor", "Consultant", "Authority"];
const salutations = ["Mr", "Ms", "Dr", "Engr", "Arch"];
const actionOptions = ["For Approval", "For Planning", "For Review", "For Information", "For Construction"];

export function CreateTransmittalModal({
  open,
  onOpenChange,
  editData,
  mode = "create",
}: CreateTransmittalModalProps) {
  const { toast } = useToast();
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    transmittal_type: editData?.transmittal_type || "",
    department: editData?.department || "",
    design_stage: editData?.design_stage || "",
    transmittal_date: editData?.transmittal_date ? new Date(editData.transmittal_date) : new Date(),
    send_to: editData?.send_to || "",
    salutation: editData?.salutation || "",
    recipient_name: editData?.recipient_name || "",
    sender_name: editData?.sender_name || "",
    sender_designation: editData?.sender_designation || "",
    send_mode: editData?.send_mode || "Softcopy",
    title: editData?.title || "",
    project_name: editData?.project_name || "",
    purpose: editData?.purpose || "",
    remarks: editData?.remarks || "",
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(
    editData?.documents || [
      {
        document_no: "",
        title: "",
        revision: 0,
        copies: 1,
        action: "For Approval",
      },
    ]
  );

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const handleAddDocument = () => {
    setDocuments([
      ...documents,
      {
        document_no: "",
        title: "",
        revision: 0,
        copies: 1,
        action: "For Approval",
      },
    ]);
  };

  const handleRemoveDocument = (index: number) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  const handleDocumentChange = (index: number, field: string, value: any) => {
    const updatedDocuments = documents.map((doc, i) => {
      if (i === index) {
        return { ...doc, [field]: value };
      }
      return doc;
    });
    setDocuments(updatedDocuments);
  };

  const handleSaveDraft = async () => {
    // Validate required fields
    if (!formData.title || documents.some(doc => !doc.document_no || !doc.title)) {
      toast({
        title: "Incomplete information",
        description: "Please provide title and complete all document information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        documents,
      };

      // Here you would make API call to save/update transmittal
      console.log("Saving draft:", payload);
      
      toast({
        title: "Draft saved",
        description: "Your transmittal has been saved as a draft.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transmittal.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    // Validate required fields
    if (!formData.title || documents.some(doc => !doc.document_no || !doc.title)) {
      toast({
        title: "Incomplete information",
        description: "Please provide title and complete all document information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        documents,
      };

      // Here you would make API call to generate transmittal
      console.log("Generating transmittal:", payload);
      
      toast({
        title: "Transmittal generated",
        description: "Your transmittal has been generated successfully.",
      });
      onOpenChange(false);
      setShowGenerateConfirm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate transmittal.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {mode === "create" && "Create New Transmittal"}
              {mode === "edit" && "Edit Transmittal"}
              {mode === "view" && "View Transmittal"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" && "Fill in the details below to create your transmittal"}
              {mode === "edit" && "Update the transmittal details"}
              {mode === "view" && "Transmittal details"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transmittal_type">Transmittal Type *</Label>
                <Select
                  value={formData.transmittal_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, transmittal_type: value })
                  }
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmittalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Select Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.transmittal_type === "Drawing" && (
                <div className="space-y-2">
                  <Label htmlFor="design_stage">Design Stage</Label>
                  <Select
                    value={formData.design_stage}
                    onValueChange={(value) =>
                      setFormData({ ...formData, design_stage: value })
                    }
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select design stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {designStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Transmittal Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.transmittal_date && "text-muted-foreground"
                      )}
                      disabled={isViewMode}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.transmittal_date ? (
                        format(formData.transmittal_date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.transmittal_date}
                      onSelect={(date) =>
                        setFormData({ ...formData, transmittal_date: date || new Date() })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="send_to">Send To *</Label>
                <Select
                  value={formData.send_to}
                  onValueChange={(value) => setFormData({ ...formData, send_to: value })}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sendToOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salutation">Salutation</Label>
                <Select
                  value={formData.salutation}
                  onValueChange={(value) => setFormData({ ...formData, salutation: value })}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select salutation" />
                  </SelectTrigger>
                  <SelectContent>
                    {salutations.map((sal) => (
                      <SelectItem key={sal} value={sal}>
                        {sal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Transmittal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Architectural Drawings - Rev A"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_name">Recipient Name *</Label>
                <Input
                  id="recipient_name"
                  placeholder="e.g., John Smith"
                  value={formData.recipient_name}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient_name: e.target.value })
                  }
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  placeholder="Your name"
                  value={formData.sender_name}
                  onChange={(e) =>
                    setFormData({ ...formData, sender_name: e.target.value })
                  }
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender_designation">Sender Designation</Label>
                <Input
                  id="sender_designation"
                  placeholder="e.g., Project Manager"
                  value={formData.sender_designation}
                  onChange={(e) =>
                    setFormData({ ...formData, sender_designation: e.target.value })
                  }
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-3">
                <Label>Send Mode *</Label>
                <RadioGroup
                  value={formData.send_mode}
                  onValueChange={(value) => setFormData({ ...formData, send_mode: value })}
                  className="flex flex-row space-x-6"
                  disabled={isViewMode}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hardcopy" id="hardcopy" disabled={isViewMode} />
                    <Label htmlFor="hardcopy">Hardcopy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Softcopy" id="softcopy" disabled={isViewMode} />
                    <Label htmlFor="softcopy">Softcopy</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name</Label>
                <Input
                  id="project_name"
                  placeholder="e.g., Hospital Wing Extension"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="Reason for this transmittal"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={3}
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Additional notes or instructions"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {formData.transmittal_type === "Drawing" ? "Drawing" : "Document"} Information *
              </Label>
              {!isViewMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDocument}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Row
                </Button>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium">
                        {formData.transmittal_type === "Drawing" ? "Drawing" : "Document"} No.
                      </th>
                      <th className="px-3 py-2 text-left text-sm font-medium">Title</th>
                      <th className="px-3 py-2 text-left text-sm font-medium">Revision</th>
                      <th className="px-3 py-2 text-left text-sm font-medium">Copies</th>
                      <th className="px-3 py-2 text-left text-sm font-medium">Action</th>
                      {!isViewMode && <th className="px-3 py-2 text-center text-sm font-medium">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">
                          <Input
                            placeholder="Doc-001"
                            value={document.document_no}
                            onChange={(e) =>
                              handleDocumentChange(index, "document_no", e.target.value)
                            }
                            className="w-full"
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            placeholder="Document title"
                            value={document.title}
                            onChange={(e) =>
                              handleDocumentChange(index, "title", e.target.value)
                            }
                            className="w-full"
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            placeholder="0"
                            value={document.revision}
                            onChange={(e) =>
                              handleDocumentChange(index, "revision", parseInt(e.target.value) || 0)
                            }
                            className="w-full"
                            min="0"
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            placeholder="1"
                            value={document.copies}
                            onChange={(e) =>
                              handleDocumentChange(index, "copies", parseInt(e.target.value) || 1)
                            }
                            className="w-full"
                            min="1"
                            disabled={isViewMode}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Select
                            value={document.action}
                            onValueChange={(value) =>
                              handleDocumentChange(index, "action", value)
                            }
                            disabled={isViewMode}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {actionOptions.map((action) => (
                                <SelectItem key={action} value={action}>
                                  {action}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        {!isViewMode && (
                          <td className="px-3 py-2 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDocument(index)}
                              disabled={documents.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {!isViewMode && (
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleSaveDraft} className="flex-1">
                Save as Draft
              </Button>
              <Button onClick={() => setShowGenerateConfirm(true)} className="flex-1">
                Generate Transmittal
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Confirmation Dialog */}
      <AlertDialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Once generated, this transmittal cannot be edited or deleted. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerate}>Yes, Generate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}