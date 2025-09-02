import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  RefreshCw,
  ServerCrash, // New icon for outages
  Info,        // New icon for info messages
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assumes you have a cn utility for classnames

// Define the possible statuses for type safety
type ServiceStatus = "Operational" | "Degraded" | "Offline" | "Normal" | "High";

// Define the structure for a service
interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
}

// ========================================================================
// === 🎨 ENHANCED UI CONFIGURATION 🎨 ===
// ========================================================================
const statusConfig = {
  Operational: {
    Icon: CheckCircle,
    label: "Operational",
    className: "text-green-600",
    badgeClasses: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  },
  Normal: {
    Icon: Activity,
    label: "Normal",
    className: "text-blue-600",
    badgeClasses: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  },
  Degraded: {
    Icon: AlertTriangle,
    label: "Degraded",
    className: "text-yellow-600",
    badgeClasses: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  },
  High: {
    Icon: AlertTriangle,
    label: "High Load",
    className: "text-yellow-600",
    badgeClasses: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  },
  Offline: {
    Icon: XCircle,
    label: "Offline",
    className: "text-red-600",
    badgeClasses: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
};

// Makes a real network request to your backend API
const fetchSystemStatus = async (): Promise<Service[]> => {
  const API_ENDPOINT = "http://localhost:8000/api/system-status";
  const response = await fetch(API_ENDPOINT);
  if (!response.ok) {
    throw new Error(`Failed to fetch system status: ${response.statusText}`);
  }
  return await response.json();
};

// ========================================================================
// === ✨ NEW OVERALL STATUS COMPONENT ✨ ===
// ========================================================================
const OverallStatusBanner = ({ services, loading, error }: { services: Service[], loading: boolean, error: string | null }) => {
  if (loading || error) return null;

  const hasOffline = services.some(s => s.status === "Offline");
  const hasDegraded = services.some(s => s.status === "Degraded" || s.status === "High");

  if (hasOffline) {
    return (
      <div className="mb-6 flex items-center gap-4 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
        <ServerCrash className="h-6 w-6" />
        <div>
          <h3 className="font-semibold">Major Outage Detected</h3>
          <p className="text-sm">Some services are offline and unavailable.</p>
        </div>
      </div>
    );
  }

  if (hasDegraded) {
    return (
      <div className="mb-6 flex items-center gap-4 rounded-lg bg-yellow-50 p-4 text-yellow-800 border border-yellow-200">
        <AlertTriangle className="h-6 w-6" />
        <div>
          <h3 className="font-semibold">Performance Degraded</h3>
          <p className="text-sm">Some services are experiencing issues.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6 flex items-center gap-4 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
      <CheckCircle className="h-6 w-6" />
      <div>
        <h3 className="font-semibold">All Systems Operational</h3>
        <p className="text-sm">All services are running smoothly.</p>
      </div>
    </div>
  );
};

export function SystemTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSystemStatus();
      setServices(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Could not connect to the status server. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getStatus();
    // Optional: Auto-refresh every 30 seconds
    const intervalId = setInterval(getStatus, 30000);
    return () => clearInterval(intervalId);
  }, [getStatus]);

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ));
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-red-50 p-8 text-red-800 border border-red-200">
          <XCircle className="h-10 w-10" />
          <p className="font-medium text-center">{error}</p>
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-secondary/50 p-8 text-muted-foreground border">
            <Info className="h-10 w-10" />
            <p className="font-medium">No system services are being monitored.</p>
        </div>
      );
    }

    return services.map((service) => {
      const config = statusConfig[service.status];
      return (
        <div key={service.id} className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4 font-medium text-card-foreground">
            <config.Icon className={cn("h-6 w-6", config.className)} />
            <span>{service.name}</span>
          </div>
          <Badge className={cn("font-semibold", config.badgeClasses)}>
            {config.label}
          </Badge>
        </div>
      );
    });
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Live overview of system components and services.
                {lastUpdated && ` Last updated: ${lastUpdated.toLocaleTimeString()}`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => getStatus()}
              disabled={loading}
              className="mt-4 sm:mt-0 w-full sm:w-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <OverallStatusBanner services={services} loading={loading} error={error} />
          <div className="divide-y rounded-lg border">
            <div className="divide-y px-4">
              {renderContent()}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}