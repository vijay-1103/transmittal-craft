import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, LayoutDashboard, ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProjectApps = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { toast } = useToast();

  // TODO: Replace with actual project data from database
  const project = {
    id: projectId,
    name: "Construction Site A",
    code: "CSA-2024",
  };

  const projectSpecificApps = [
    {
      id: 1,
      name: "Transmittal Manager",
      description: "Manage document transmittals",
      icon: FileText,
      onClick: () => navigate(`/project/${projectId}/transmittals`),
    },
    {
      id: 2,
      name: "Dashboard",
      description: "Project overview and analytics",
      icon: LayoutDashboard,
      onClick: () => toast({ title: "Coming Soon", description: "Project Dashboard will be available soon" }),
    },
  ];

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been logged out successfully" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="/src/assets/hosmac-logo.jpg" 
                alt="Hosmac Logo" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
                <p className="text-sm text-muted-foreground">{project.code}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Project Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectSpecificApps.map((app) => {
              const Icon = app.icon;
              return (
                <Card 
                  key={app.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={app.onClick}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <CardDescription className="mt-1">{app.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectApps;
