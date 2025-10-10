import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Document {
  documentNo: string;
  title: string;
  revision: number;
  copies: number;
  action: string;
}

interface CreateTransmittalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any;
  mode: "create" | "edit" | "view";
}

export function CreateTransmittalModal({
  open,
  onOpenChange,
  editData,
  mode,
}: CreateTransmittalModalProps) {
  const { toast } = useToast();
  const isViewMode = mode === "view";
  const isDraft = editData?.status === "draft";
  const isSent = editData?.status === "sent";
  const isReceived = editData?.status === "received";

  const [transmittalType, setTransmittalType] = useState(editData?.transmittalType || "");
  const [department, setDepartment] = useState(editData?.department || "");
  const [designStage, setDesignStage] = useState(editData?.designStage || "");
  const [transmittalDate, setTransmittalDate] = useState<Date | undefined>(
    editData?.transmittalDate ? new Date(editData.transmittalDate) : undefined
  );
  const [sendTo, setSendTo] = useState(editData?.sendTo || "");
  const [salutation, setSalutation] = useState(editData?.salutation || "");
  const [recipientName, setRecipientName] = useState(editData?.recipientName || "");
  const [senderName, setSenderName] = useState(editData?.senderName || "");
  const [senderDesignation, setSenderDesignation] = useState(editData?.senderDesignation || "");
  const [sendMode, setSendMode] = useState(editData?.sendMode || "Softcopy");
  const [documents, setDocuments] = useState<Document[]>(
    editData?.documents || [{ documentNo: "", title: "", revision: 0, copies: 1, action: "" }]
  );

  // Additional fields for Sent status
  const [whoIsDelivering, setWhoIsDelivering] = useState(editData?.whoIsDelivering || "");

  // Additional fields for Received status
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receivedDate, setReceivedDate] = useState<Date | undefined>(
    editData?.receivedDate ? new Date(editData.receivedDate) : undefined
  );
  const [receivedTime, setReceivedTime] = useState(editData?.receivedTime || "");

  const addDocument = () => {
    setDocuments([...documents, { documentNo: "", title: "", revision: 0, copies: 1, action: "" }]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: keyof Document, value: any) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    setDocuments(updated);
  };

  const handleSave = () => {
    // Validation
    if (!transmittalType || !department || !sendMode || documents.length === 0) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: mode === "create" ? "Draft saved" : "Updated",
      description: mode === "create" ? "Transmittal saved as draft." : "Transmittal updated successfully.",
    });
    onOpenChange(false);
  };

  const canEditAdditionalFields = () => {
    if (isSent) {
      return editData?.sentStatus !== "Sent";
    }
    if (isReceived) {
      return editData?.receivedStatus !== "Received";
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Transmittal" : mode === "edit" ? "Edit Transmittal" : "View Transmittal"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Fill in the details below to create a new transmittal" : "Transmittal details"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transmittalType">Transmittal Type *</Label>
                <Select value={transmittalType} onValueChange={setTransmittalType} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drawing">Drawing</SelectItem>
                    <SelectItem value="Documents">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Select Department *</Label>
                <Select value={department} onValueChange={setDepartment} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Architecture">Architecture</SelectItem>
                    <SelectItem value="Interior Design">Interior Design</SelectItem>
                    <SelectItem value="MEP">MEP</SelectItem>
                    <SelectItem value="Structural">Structural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {transmittalType === "Drawing" && (
                <div className="space-y-2">
                  <Label htmlFor="designStage">Design Stage</Label>
                  <Select value={designStage} onValueChange={setDesignStage} disabled={isViewMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conceptual">Conceptual</SelectItem>
                      <SelectItem value="Schematic">Schematic</SelectItem>
                      <SelectItem value="Design Development">Design Development</SelectItem>
                      <SelectItem value="Construction Documents">Construction Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Transmittal Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !transmittalDate && "text-muted-foreground"
                      )}
                      disabled={isViewMode}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {transmittalDate ? format(transmittalDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={transmittalDate}
                      onSelect={setTransmittalDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Send To</Label>
                <Select value={sendTo} onValueChange={setSendTo} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Salutation</Label>
                <Select value={salutation} onValueChange={setSalutation} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salutation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name"
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label>Sender Name</Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter sender name"
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label>Sender Designation</Label>
                <Input
                  value={senderDesignation}
                  onChange={(e) => setSenderDesignation(e.target.value)}
                  placeholder="Enter designation"
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Send Mode */}
            <div className="space-y-2">
              <Label>Send Mode *</Label>
              <RadioGroup value={sendMode} onValueChange={setSendMode} disabled={isViewMode}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hardcopy" id="hardcopy" />
                    <Label htmlFor="hardcopy" className="font-normal cursor-pointer">Hardcopy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Softcopy" id="softcopy" />
                    <Label htmlFor="softcopy" className="font-normal cursor-pointer">Softcopy</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Additional fields for Sent status */}
            {isSent && sendMode === "Hardcopy" && (
              <div className="space-y-2">
                <Label>Who is Delivering</Label>
                <Select
                  value={whoIsDelivering}
                  onValueChange={setWhoIsDelivering}
                  disabled={isViewMode || !canEditAdditionalFields()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deliverer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receptionist">Receptionist</SelectItem>
                    <SelectItem value="Me">Me</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Additional fields for Received status */}
            {isReceived && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Upload Receipt</Label>
                  <Input
                    type="file"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    disabled={isViewMode || !canEditAdditionalFields()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Received Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !receivedDate && "text-muted-foreground"
                        )}
                        disabled={isViewMode || !canEditAdditionalFields()}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {receivedDate ? format(receivedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={receivedDate}
                        onSelect={setReceivedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Received Time</Label>
                  <Input
                    type="time"
                    value={receivedTime}
                    onChange={(e) => setReceivedTime(e.target.value)}
                    disabled={isViewMode || !canEditAdditionalFields()}
                  />
                </div>
              </div>
            )}

            {/* Document Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Drawing/Document Information *</Label>
                {!isViewMode && (
                  <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                )}
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left text-xs font-medium">Doc/Drawing No</th>
                        <th className="p-2 text-left text-xs font-medium">Title</th>
                        <th className="p-2 text-left text-xs font-medium w-20">Revision</th>
                        <th className="p-2 text-left text-xs font-medium w-20">Copies</th>
                        <th className="p-2 text-left text-xs font-medium">Action</th>
                        {!isViewMode && <th className="p-2 w-12"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <Input
                              value={doc.documentNo}
                              onChange={(e) => updateDocument(index, "documentNo", e.target.value)}
                              placeholder="Doc no"
                              className="h-8 text-xs"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={doc.title}
                              onChange={(e) => updateDocument(index, "title", e.target.value)}
                              placeholder="Title"
                              className="h-8 text-xs"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={doc.revision}
                              onChange={(e) => updateDocument(index, "revision", parseInt(e.target.value) || 0)}
                              className="h-8 text-xs"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={doc.copies}
                              onChange={(e) => updateDocument(index, "copies", parseInt(e.target.value) || 1)}
                              className="h-8 text-xs"
                              disabled={isViewMode}
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={doc.action}
                              onValueChange={(value) => updateDocument(index, "action", value)}
                              disabled={isViewMode}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="For Approval">For Approval</SelectItem>
                                <SelectItem value="For Planning">For Planning</SelectItem>
                                <SelectItem value="For Review">For Review</SelectItem>
                                <SelectItem value="For Information">For Information</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          {!isViewMode && (
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(index)}
                                disabled={documents.length === 1}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSave} className="flex-1">
              {mode === "create" ? "Save as Draft" : "Save"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
