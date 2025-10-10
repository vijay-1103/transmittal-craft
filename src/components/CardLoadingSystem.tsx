import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, FileText, User, Calendar } from 'lucide-react';

// Mock data generator
const generateMockData = (count: number) => {
  const statuses = ['received', 'sent', 'generated', 'draft'] as const;
  const types = [
    'Architectural Drawings',
    'MEP Systems - HVAC & Electrical',
    'Interior Design Package',
    'Structural Drawings',
    'Site Plan Updates',
    'Floor Plans',
    'Elevation Drawings',
    'Plumbing Systems'
  ];
  const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Davis', 'Alex Kumar'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `TRN-2024-${String(i + 1).padStart(3, '0')}`,
    title: types[i % types.length],
    status: statuses[i % statuses.length],
    documents: Math.floor(Math.random() * 15) + 2,
    assignee: names[i % names.length],
    date: new Date(2024, 9, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0]
  }));
};

const SkeletonCard = () => (
  <div className="bg-card rounded-lg shadow-sm border border-border p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 bg-muted rounded w-3/4"></div>
      <div className="h-6 bg-muted rounded-full w-20"></div>
    </div>
    <div className="h-4 bg-muted rounded w-24 mb-4"></div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-muted rounded w-32"></div>
      <div className="h-4 bg-muted rounded w-28"></div>
      <div className="h-4 bg-muted rounded w-36"></div>
    </div>
    <div className="h-10 bg-muted rounded"></div>
  </div>
);

interface Project {
  id: string;
  title: string;
  status: 'received' | 'sent' | 'generated' | 'draft';
  documents: number;
  assignee: string;
  date: string;
}

const ProjectCard = ({ project }: { project: Project }) => {
  const statusConfig = {
    received: {
      label: 'Received',
      className: 'bg-[hsl(var(--status-received))] text-white'
    },
    sent: {
      label: 'Sent',
      className: 'bg-[hsl(var(--status-sent))] text-white'
    },
    generated: {
      label: 'Generated',
      className: 'bg-[hsl(var(--status-generated))] text-white'
    },
    draft: {
      label: 'Draft',
      className: 'bg-[hsl(var(--status-draft))] text-white'
    }
  };

  const status = statusConfig[project.status];

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-card-foreground text-sm pr-2 line-clamp-2">
          {project.title}
        </h3>
        <span className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${status.className}`}>
          {status.label}
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">{project.id}</p>
      
      <div className="space-y-2 mb-6 text-sm text-card-foreground">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span>{project.documents} documents</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>{project.assignee}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{project.date}</span>
        </div>
      </div>
      
      <button className="w-full py-2 px-4 border border-primary text-primary rounded hover:bg-primary/10 transition-colors font-medium text-sm flex items-center justify-center gap-2">
        View
        <span>→</span>
      </button>
    </div>
  );
};

const CardLoadingSystem = () => {
  const [allData] = useState(() => generateMockData(150));
  const [displayedData, setDisplayedData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [itemsToShow, setItemsToShow] = useState(20);
  
  const ITEMS_PER_LOAD = 20;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const filteredAndSortedData = React.useMemo(() => {
    let filtered = allData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

    return filtered;
  }, [allData, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    setDisplayedData(filteredAndSortedData.slice(0, itemsToShow));
  }, [filteredAndSortedData, itemsToShow]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setItemsToShow(prev => prev + ITEMS_PER_LOAD);
      setLoadingMore(false);
    }, 800);
  };

  const hasMore = displayedData.length < filteredAndSortedData.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Project Documents</h1>
        
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="sent">Sent</option>
                <option value="generated">Generated</option>
                <option value="draft">Draft</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-background text-foreground"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{displayedData.length}</span> of{' '}
            <span className="font-semibold text-foreground">{filteredAndSortedData.length}</span> projects
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayedData.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
            <p className="text-muted-foreground text-lg">No projects found</p>
            <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedData.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ChevronDown className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {loadingMore && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardLoadingSystem;
