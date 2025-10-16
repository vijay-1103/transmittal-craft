import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, LayoutDashboard, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import hosmacLogo from "@/assets/hosmac-logo.jpg";

const ProjectSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("all");

  // TODO: Replace with actual project data from database
  const projects = [
    { id: 1, name: "Construction Site A", code: "CSA-2024", status: "Active" },
    { id: 2, name: "Office Complex B", code: "OCB-2024", status: "Active" },
    { id: 3, name: "Residential Tower C", code: "RTC-2024", status: "Completed" },
    { id: 4, name: "Hospital Wing D", code: "HWD-2024", status: "Active" },
    { id: 5, name: "Shopping Mall E", code: "SME-2024", status: "Completed" },
  ];

  const filteredProjects = projects.filter((project) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "active") return project.status === "Active";
    if (selectedTab === "completed") return project.status === "Completed";
    return true;
  });

  const projectAgnosticApps = [
    {
      id: 1,
      name: "Dashboard",
      description: "Overview of all projects",
      icon: LayoutDashboard,
      onClick: () => toast({ title: "Coming Soon", description: "Dashboard will be available soon" }),
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
          <div className="flex items-center gap-3">
            <img 
              src={hosmacLogo} 
              alt="Hosmac Logo" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <h1 className="text-xl font-semibold text-foreground">Hosmac Portal</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Project Agnostic Applications */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectAgnosticApps.map((app) => {
              const Icon = app.icon;
              return (
                <Card 
                  key={app.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={app.onClick}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                    </div>
                    <CardDescription>{app.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Select a Project</h2>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card 
                    key={project.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}/apps`)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <CardDescription className="text-sm">{project.code}</CardDescription>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === "Active" 
                            ? "bg-primary/20 text-primary" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default ProjectSelection;
