import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FileText, Calendar, User, ArrowRight, MoreVertical, Edit, Trash2, Download, Share, Copy } from "lucide-react";

interface TransmittalCardProps {
  id: string;
  transmittalNumber?: string;
  title: string;
  status: "draft" | "generated" | "sent" | "received";
  recipient?: string;
  documentCount: number;
  createdDate: string;
  sentStatus?: string; // For sent tab: "Sent" | "Not Sent"
  receivedStatus?: string; // For received tab: "Received" | "Not Received"
  sendMode?: string; // "Hardcopy" | "Softcopy"
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onGenerate?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDuplicate?: (mode: "opposite" | "same") => void;
  onSendToOther?: () => void;
}

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-[hsl(var(--status-draft))] text-white hover:bg-[hsl(var(--status-draft))]/90",
  },
  generated: {
    label: "Generated",
    className: "bg-[hsl(var(--status-generated))] text-white hover:bg-[hsl(var(--status-generated))]/90",
  },
  sent: {
    label: "Sent",
    className: "bg-[hsl(var(--status-sent))] text-white hover:bg-[hsl(var(--status-sent))]/90",
  },
  received: {
    label: "Received",
    className: "bg-[hsl(var(--status-received))] text-white hover:bg-[hsl(var(--status-received))]/90",
  },
};

export function TransmittalCard({
  transmittalNumber,
  title,
  status,
  recipient,
  documentCount,
  createdDate,
  sentStatus,
  receivedStatus,
  sendMode,
  onView,
  onEdit,
  onDelete,
  onGenerate,
  onDownload,
  onShare,
  onDuplicate,
  onSendToOther,
}: TransmittalCardProps) {
  const getDisplayStatus = () => {
    if (status === "sent" && sentStatus) {
      return sentStatus;
    }
    if (status === "received" && receivedStatus) {
      return receivedStatus;
    }
    return statusConfig[status].label;
  };

  const getStatusClassName = () => {
    if (status === "sent") {
      return sentStatus === "Sent" 
        ? "bg-green-600 text-white hover:bg-green-600/90"
        : "bg-yellow-600 text-white hover:bg-yellow-600/90";
    }
    if (status === "received") {
      return receivedStatus === "Received"
        ? "bg-blue-600 text-white hover:bg-blue-600/90"
        : "bg-orange-600 text-white hover:bg-orange-600/90";
    }
    return statusConfig[status].className;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{title}</h3>
            {transmittalNumber && (
              <p className="text-sm text-muted-foreground mt-1">
                {transmittalNumber}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusClassName()}>
              {getDisplayStatus()}
            </Badge>
            {(status === "generated" || status === "sent" || status === "received") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onDownload && (
                    <DropdownMenuItem onClick={onDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => onDuplicate("opposite")}>
                      <Copy className="mr-2 h-4 w-4" />
                      Send as {sendMode === "Softcopy" ? "Hardcopy" : "Softcopy"}
                    </DropdownMenuItem>
                  )}
                  {onSendToOther && (
                    <DropdownMenuItem onClick={onSendToOther}>
                      <User className="mr-2 h-4 w-4" />
                      Send to Other Recipient
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{documentCount} {documentCount === 1 ? 'document' : 'documents'}</span>
        </div>
        
        {recipient && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{recipient}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{createdDate}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t gap-2">
        {status === "draft" ? (
          <>
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onView} className="flex-1">
              View
            </Button>
            {onGenerate && (
              <Button size="sm" onClick={onGenerate} className="flex-1">
                Generate
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete} className="px-2">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onView} className="w-full">
            View
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
