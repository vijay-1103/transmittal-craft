import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocuments: (documents: any[]) => void;
}

// Mock data - will be replaced with actual database integration
const mockDocuments = [
  { id: "1", name: "Architectural Floor Plan - Level 1", revision: "A", category: "Architecture" },
  { id: "2", name: "Architectural Floor Plan - Level 2", revision: "B", category: "Architecture" },
  { id: "3", name: "MEP - HVAC Layout", revision: "A", category: "MEP" },
  { id: "4", name: "Electrical Distribution Plan", revision: "C", category: "MEP" },
  { id: "5", name: "Plumbing Schematic", revision: "A", category: "MEP" },
  { id: "6", name: "Interior Design - Reception Area", revision: "B", category: "Interior" },
  { id: "7", name: "Structural Foundation Plan", revision: "A", category: "Structural" },
  { id: "8", name: "Site Plan", revision: "D", category: "Architecture" },
];

export function DocumentLibraryModal({
  open,
  onOpenChange,
  onSelectDocuments,
}: DocumentLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);

  const filteredDocuments = mockDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.revision.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDocument = (doc: any) => {
    setSelectedDocs((prev) =>
      prev.find((d) => d.id === doc.id)
        ? prev.filter((d) => d.id !== doc.id)
        : [...prev, doc]
    );
  };

  const handleAdd = () => {
    onSelectDocuments(selectedDocs);
    setSelectedDocs([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Document Library</DialogTitle>
          <DialogDescription>
            Search and select documents to add to your transmittal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name, revision, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {selectedDocs.length} selected
            </p>
            {selectedDocs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDocs([])}
              >
                Clear selection
              </Button>
            )}
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDocs.find((d) => d.id === doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDocument(doc)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight mb-2">
                          {doc.name}
                        </h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            Rev: {doc.revision}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {doc.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selectedDocs.length === 0}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedDocs.length} Document{selectedDocs.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
