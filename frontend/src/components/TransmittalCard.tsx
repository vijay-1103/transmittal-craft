import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, ArrowRight } from "lucide-react";

interface TransmittalCardProps {
  id: string;
  transmittalNumber?: string;
  title: string;
  status: "draft" | "generated" | "sent" | "received";
  recipient?: string;
  documentCount: number;
  createdDate: string;
  onView: () => void;
  onEdit?: () => void;
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
  onView,
  onEdit,
}: TransmittalCardProps) {
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
          <Badge className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
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
        {status === "draft" && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            Edit
          </Button>
        )}
        <Button 
          variant={status === "draft" ? "default" : "outline"} 
          size="sm" 
          onClick={onView}
          className="flex-1"
        >
          View
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
