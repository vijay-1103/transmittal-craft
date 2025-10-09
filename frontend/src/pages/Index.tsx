import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { TransmittalCard } from "@/components/TransmittalCard";
import { CreateTransmittalModal } from "@/components/CreateTransmittalModal";
import { ShareModal } from "@/components/ShareModal";
import { useToast } from "@/hooks/use-toast";
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
import logo from "@/assets/hosmac-logo.jpg";

// Mock data - will be replaced with actual database
const mockTransmittals = [
  {
    id: "1",
    transmittalNumber: "TRN-2024-001",
    title: "Architectural Drawings - Level 1 & 2",
    status: "received" as const,
    recipient: "John Smith",
    documentCount: 5,
    createdDate: "2024-10-01",
    sendMode: "Softcopy",
    receivedStatus: "Received",
  },
  {
    id: "2",
    transmittalNumber: "TRN-2024-002",
    title: "MEP Systems - HVAC & Electrical",
    status: "sent" as const,
    recipient: "Sarah Johnson",
    documentCount: 8,
    createdDate: "2024-10-05",
    sendMode: "Hardcopy",
    sentStatus: "Sent",
  },
  {
    id: "3",
    transmittalNumber: "TRN-2024-003",
    title: "Interior Design Package",
    status: "generated" as const,
    recipient: "Mike Chen",
    documentCount: 12,
    createdDate: "2024-10-07",
    sendMode: "Softcopy",
  },
  {
    id: "4",
    title: "Structural Drawings - Draft",
    status: "draft" as const,
    documentCount: 3,
    createdDate: "2024-10-09",
    sendMode: "Hardcopy",
  },
  {
    id: "5",
    title: "Site Plan Updates",
    status: "draft" as const,
    documentCount: 2,
    createdDate: "2024-10-09",
    sendMode: "Softcopy",
  },
  // Additional mock data for pagination testing
  {
    id: "6",
    transmittalNumber: "TRN-2024-004",
    title: "Foundation Details",
    status: "generated" as const,
    recipient: "Alex Brown",
    documentCount: 4,
    createdDate: "2024-10-08",
    sendMode: "Hardcopy",
  },
  {
    id: "7",
    transmittalNumber: "TRN-2024-005",
    title: "Electrical Layout",
    status: "sent" as const,
    recipient: "Lisa Wang",
    documentCount: 6,
    createdDate: "2024-10-06",
    sendMode: "Softcopy",
    sentStatus: "Not Sent",
  },
  {
    id: "8",
    title: "Plumbing Drawings - Draft",
    status: "draft" as const,
    documentCount: 3,
    createdDate: "2024-10-08",
    sendMode: "Hardcopy",
  },
  {
    id: "9",
    transmittalNumber: "TRN-2024-006",
    title: "Landscape Plan",
    status: "received" as const,
    recipient: "Tom Wilson",
    documentCount: 2,
    createdDate: "2024-10-04",
    sendMode: "Softcopy",
    receivedStatus: "Not Received",
  },
  {
    id: "10",
    title: "Fire Safety Plan",
    status: "draft" as const,
    documentCount: 5,
    createdDate: "2024-10-07",
    sendMode: "Hardcopy",
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTransmittal, setSelectedTransmittal] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [itemsToShow, setItemsToShow] = useState(9);
  const { toast } = useToast();

  const filteredTransmittals = mockTransmittals.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.transmittalNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipient?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || t.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const displayedTransmittals = filteredTransmittals.slice(0, itemsToShow);
  const hasMore = filteredTransmittals.length > itemsToShow;

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 6);
  };

  const handleCreateTransmittal = () => {
    setSelectedTransmittal(null);
    setModalMode("create");
    setCreateModalOpen(true);
  };

  const handleEditTransmittal = (transmittal: any) => {
    setSelectedTransmittal(transmittal);
    setModalMode("edit");
    setCreateModalOpen(true);
  };

  const handleViewTransmittal = (transmittal: any) => {
    setSelectedTransmittal(transmittal);
    setModalMode("view");
    setCreateModalOpen(true);
  };

  const handleDeleteTransmittal = (transmittal: any) => {
    setSelectedTransmittal(transmittal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTransmittal) {
      // Here you would make API call to delete
      toast({
        title: "Transmittal deleted",
        description: `"${selectedTransmittal.title}" has been deleted.`,
      });
    }
    setDeleteDialogOpen(false);
    setSelectedTransmittal(null);
  };

  const handleGenerateTransmittal = (transmittal: any) => {
    setSelectedTransmittal(transmittal);
    setGenerateDialogOpen(true);
  };

  const confirmGenerate = () => {
    if (selectedTransmittal) {
      // Here you would make API call to generate
      toast({
        title: "Transmittal generated",
        description: `"${selectedTransmittal.title}" has been generated successfully.`,
      });
    }
    setGenerateDialogOpen(false);
    setSelectedTransmittal(null);
  };

  const handleShare = (transmittal: any) => {
    setSelectedTransmittal(transmittal);
    setShareModalOpen(true);
  };

  const handleDuplicate = (transmittal: any, mode: "opposite" | "same") => {
    // Here you would make API call to duplicate
    const newMode = mode === "opposite" 
      ? (transmittal.sendMode === "Softcopy" ? "Hardcopy" : "Softcopy")
      : transmittal.sendMode;
    
    toast({
      title: "Transmittal duplicated",
      description: `Created ${newMode} copy of "${transmittal.title}".`,
    });
  };

  const handleSendToOther = (transmittal: any) => {
    setSelectedTransmittal(transmittal);
    setModalMode("create"); // Use create mode with pre-filled data
    setCreateModalOpen(true);
  };

  const handleDownload = (transmittal: any) => {
    // Mock download functionality
    toast({
      title: "Download started",
      description: `Downloading "${transmittal.title}".`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Hosmac" className="h-8 md:h-10 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-foreground">
                  Transmittal Manager
                </h1>
                <p className="text-xs text-muted-foreground">
                  Create and manage your transmittals
                </p>
              </div>
            </div>
            <Button onClick={() => setCreateSheetOpen(true)} size="sm" className="md:size-default">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Create Transmittal</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transmittals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
              <TabsTrigger value="draft" className="text-xs md:text-sm">Draft</TabsTrigger>
              <TabsTrigger value="generated" className="text-xs md:text-sm">Generated</TabsTrigger>
              <TabsTrigger value="sent" className="text-xs md:text-sm">Sent</TabsTrigger>
              <TabsTrigger value="received" className="text-xs md:text-sm">Received</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredTransmittals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No transmittals found matching your search"
                      : activeTab === "all"
                      ? "No transmittals yet"
                      : `No ${activeTab} transmittals`}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCreateSheetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Transmittal
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTransmittals.map((transmittal) => (
                    <TransmittalCard
                      key={transmittal.id}
                      {...transmittal}
                      onView={() => console.log("View", transmittal.id)}
                      onEdit={
                        transmittal.status === "draft"
                          ? () => setCreateSheetOpen(true)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modals and Sheets */}
      <CreateTransmittalSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onOpenDocumentLibrary={() => {
          setDocumentLibraryOpen(true);
        }}
      />

      <DocumentLibraryModal
        open={documentLibraryOpen}
        onOpenChange={setDocumentLibraryOpen}
        onSelectDocuments={(docs) => {
          console.log("Selected documents:", docs);
        }}
      />
    </div>
  );
};

export default Index;
