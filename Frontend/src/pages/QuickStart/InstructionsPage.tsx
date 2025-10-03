import {
  Play,
  Square,
  Loader2,
  FileText,
  Users,
  FileVideo,
  Calendar,
  Zap,
  CornerDownRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function InstructionsPage() {
  const steps = [
    {
      icon: Play,
      title: "1. Start Session",
      color: "text-blue-600 border-blue-600 bg-blue-500/10 dark:text-blue-400 dark:border-blue-400",
      description:
        "Seat your child comfortably in front of the screen in a quiet area. When ready, click the 'Start Session' button below. A short, child-friendly video will begin playing (approx. 15–20 seconds).",
    },
    {
      icon: Square,
      title: "2. Stop Once",
      color: "text-red-600 border-red-600 bg-red-500/10 dark:text-red-400 dark:border-red-400",
      description:
        "Immediately after the video finishes, click the 'Stop' button **one time**. This action saves the session data and initiates processing.",
    },
    {
      icon: Loader2,
      title: "3. Wait for Analysis",
      color: "text-yellow-600 border-yellow-600 bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-400",
      description:
        "Please wait for approximately 15 seconds while the system compiles and analyzes your child’s eye-tracking data. **Crucially, avoid refreshing or closing the page during this analysis.**",
      spin: true,
    },
    {
      icon: FileText,
      title: "4. View Report",
      color: "text-green-600 border-green-600 bg-green-500/10 dark:text-green-400 dark:border-green-400",
      description:
        "Once the automated analysis is complete, a detailed, comprehensive report will **automatically appear** with the session results and next steps.",
    },
  ];

  const dashboardFeatures = [
    {
      icon: Users,
      title: "Manage Children",
      description:
        "Add and manage profiles. Each child keeps their own session history and reports for focused tracking.",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      icon: Play,
      title: "Start Session",
      description:
        "Quickly begin a new eye-tracking session for your selected child profile.",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: FileText,
      title: "View All Reports",
      description:
        "Access all past reports in one place. Easily track progress, compare results, and share them with a specialist.",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      icon: Calendar,
      title: "Book Appointments",
      description:
        "Easily book an appointment with certified doctors directly through the app to discuss your child’s progress and results.",
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
  ];

  return (
    <DashboardLayout>
      {/* Removed max-w-5xl to make the card span the full dashboard content width */}
      <div className="space-y-6 pb-12"> 
        <Card className="shadow-xl border border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 md:p-8 space-y-10">

            {/* 1. Dashboard Features Section (Quick Access) */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Quick Access & Management Tools
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {dashboardFeatures.map((feature, index) => (
                    <Card
                    key={index}
                    className="shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                    >
                    <CardHeader className="flex flex-col space-y-3 p-5">
                        <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${feature.color} border border-transparent`}
                        >
                        <feature.icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">
                        {feature.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                        </p>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </section>

            <Separator />

            {/* 2. Guided Session Instructions */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Guided Session Instructions
                </h2>
                
                {/* Before You Start - Preparation Checklist */}
                <div className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg shadow-inner">
                    <div className="flex items-center space-x-3">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Preparation Checklist
                        </h3>
                    </div>
                    <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400 text-sm list-disc pl-5">
                        <li>Ensure the room is **well-lit** and **quiet** to minimize distractions.</li>
                        <li>Make sure your child is positioned **upright** and the laptop should be placed on a surface at an angle where the child's face and eyes are visible.</li>
                    </ul>
                </div>

                {/* Session Execution Timeline */}
                <div className="relative pt-2">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="flex mb-8 last:mb-0 items-start group">
                            {/* Step Marker/Icon Container */}
                            <div className="relative flex-shrink-0 z-10">
                                <div
                                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.color} border-4 border-card shadow-md group-hover:scale-105`}
                                >
                                    <step.icon
                                        className={`h-5 w-5 ${step.spin ? "animate-spin" : ""}`}
                                    />
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="ml-5 flex-grow min-w-0">
                                <h3 className="font-bold text-lg mb-0.5 text-gray-800 dark:text-gray-100">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
