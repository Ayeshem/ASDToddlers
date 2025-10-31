// import {
//     Play,
//     Square,
//     Loader2,
//     FileText,
//     Users,
//     Calendar,
//     Zap,
//   } from "lucide-react";
//   import { DashboardLayout } from "@/components/layout/dashboard-layout";
//   import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
//   import { Button } from "@/components/ui/button";
//   import { Separator } from "@/components/ui/separator";
  
//   export default function UserGuideDoc() {
//     const steps = [
//       {
//         icon: Play,
//         title: "1. Start Session",
//         color:
//           "text-blue-600 border-blue-600 bg-blue-500/10 dark:text-blue-400 dark:border-blue-400",
//         description: (
//           <>
//             Seat your child comfortably in front of the screen in a quiet area. When
//             ready, click the <strong>Start Session</strong> button below. A
//             child-friendly video will begin playing and continue for about{" "}
//             <strong>2 minutes</strong> in total.
//           </>
//         ),
//       },
//       {
//         icon: Square,
//         title: "2. Press Stop",
//         color:
//           "text-red-600 border-red-600 bg-red-500/10 dark:text-red-400 dark:border-red-400",
//         description: (
//           <>
//             After about <strong>25–30 seconds</strong> of video playback, click the{" "}
//             <strong>Stop</strong> button <strong>once</strong>. Do not
//             press it again. The video will continue running, but the system will
//             begin background processing.
//           </>
//         ),
//       },  
//       {
//         icon: Loader2,
//         title: "3. Wait for Analysis",
//         color:
//           "text-yellow-600 border-yellow-600 bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-400",
//         description: (
//           <>
//             After pressing Stop, please wait <strong>15–20 seconds</strong> while
//             the video continues playing. The system is processing in the background.{" "}
//             <strong>Do not refresh the page or press Stop again</strong> during this
//             time.
//           </>
//         ),
//         spin: true,
//       },
//       {
//         icon: FileText,
//         title: "4. View Report",
//         color:
//           "text-green-600 border-green-600 bg-green-500/10 dark:text-green-400 dark:border-green-400",
//         description: (
//           <>
//             As soon as analysis is complete, you will be{" "}
//             <strong>automatically redirected</strong> to a detailed report. No extra
//             steps are required from you.
//           </>
//         ),
//       },
//     ];
    
//     const dashboardFeatures = [
//       {
//         icon: Users,
//         title: "Manage Children",
//         description:
//           "Add and manage profiles. Each child keeps their own session history and reports for focused tracking.",
//         // New color classes for the card body and border
//         cardColor: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
//         iconColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
//       },
//       {
//         icon: Play,
//         title: "Start Session",
//         description:
//           "Quickly begin a new eye-tracking session for your selected child profile.",
//         // New color classes for the card body and border
//         cardColor: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
//         iconColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
//       },
//       {
//         icon: FileText,
//         title: "View All Reports",
//         description:
//           "Access all past reports in one place. Easily track progress, compare results, and share them with a specialist.",
//         // New color classes for the card body and border
//         cardColor: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
//         iconColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
//       },
//       {
//         icon: Calendar,
//         title: "Book Appointments",
//         description:
//           "Easily book an appointment with certified doctors directly through the app to discuss your child’s progress and results.",
//         // New color classes for the card body and border
//         cardColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
//         iconColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
//       },
//     ];
  
//     return (
//       <DashboardLayout>
//         <div className="space-y-6 pb-12"> 
          
//           {/* Key Features Card - The main container remains clean */}
//           <Card className="shadow-xl border border-gray-200 dark:border-gray-800">
//             <CardContent className="p-6 md:p-8 space-y-10">
//               <section className="space-y-6">
//                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
//                   Key Features
//                 </h2>
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//                   {dashboardFeatures.map((feature, index) => (
//                     <Card
//                       key={index}
//                       // APPLYING THE COLOR TO THE CARD HERE!
//                       className={`shadow-lg border ${feature.cardColor} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
//                     >
//                       <CardHeader className="flex flex-col space-y-3 p-5">
//                         <div
//                           // APPLYING THE ICON COLOR HERE!
//                           className={`h-10 w-10 rounded-xl flex items-center justify-center ${feature.iconColor} shadow-inner`}
//                         >
//                           <feature.icon className="h-5 w-5" />
//                         </div>
//                         <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50">
//                           {feature.title}
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent className="p-5 pt-0">
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           {feature.description}
//                         </p>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               </section>
//             </CardContent>
//           </Card>
    
//           {/* Guided Session Instructions Card */}
//           <Card className="shadow-xl border border-gray-200 dark:border-gray-800">
//             <CardContent className="p-6 md:p-8 space-y-10">
//               <section className="space-y-6">
//                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
//                   Guided Session Instructions
//                 </h2>
                
//                 {/* Before You Start - Preparation Checklist */}
//                 <div className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg shadow-inner">
//                   <div className="flex items-center space-x-3">
//                     <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
//                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
//                       Preparation Checklist
//                     </h3>
//                   </div>
//                   <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400 text-sm list-disc pl-5">
//                     <li>Ensure the room is <strong>well-lit</strong> and <strong>quiet</strong> to minimize distractions.</li>
//                     <li>Make sure your child is positioned <strong>upright</strong> and the laptop is placed so their face and eyes are visible.</li>
//                   </ul>
//                 </div>
    
//                 {/* Session Execution Timeline */}
//                 <div className="relative pt-2">
//                   <div className="absolute left-6 top-0 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
    
//                   {steps.map((step, index) => (
//                     <div key={index} className="flex mb-8 last:mb-0 items-start group">
//                       <div className="relative flex-shrink-0 z-10">
//                         <div
//                           className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.color} border-4 border-card shadow-md group-hover:scale-105`}
//                         >
//                           <step.icon
//                             className={`h-5 w-5 ${step.spin ? "animate-spin" : ""}`}
//                           />
//                         </div>
//                       </div>
    
//                       <div className="ml-5 flex-grow min-w-0">
//                         <h3 className="font-bold text-lg mb-0.5 text-gray-800 dark:text-gray-100">
//                           {step.title}
//                         </h3>
//                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
//                           {step.description}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </section>
//             </CardContent>
//           </Card>
//         </div>
//       </DashboardLayout>
//     );
//   }


import {
    Play,
    Square,
    Loader2,
    FileText,
    Users,
    Calendar,
    Zap,
    Video,
    Edit3,
    Upload,
    CheckCircle2,
    XCircle,
  } from "lucide-react";
  import { DashboardLayout } from "@/components/layout/dashboard-layout";
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  
  export default function UserGuideDoc() {
    const steps = [
      {
        icon: Users,
        title: "1. View All Patients",
        color:
          "text-blue-600 border-blue-600 bg-blue-500/10 dark:text-blue-400 dark:border-blue-400",
        description: (
          <>
            Access the <strong>Patients</strong> section to view all registered
            children under your care. Click any patient profile to see their
            complete assessment history, progress charts, and detailed reports.
          </>
        ),
      },
      {
        icon: FileText,
        title: "2. View Assessment Reports",
        color:
          "text-green-600 border-green-600 bg-green-500/10 dark:text-green-400 dark:border-green-400",
        description: (
          <>
            In each patient’s dashboard, navigate to the{" "}
            <strong>Reports</strong> tab to review automated assessment summaries.
            You can compare reports over time to monitor improvement or regression.
          </>
        ),
      },
      {
        icon: Calendar,
        title: "3. Manage Appointments",
        color:
          "text-yellow-600 border-yellow-600 bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-400",
        description: (
          <>
            Go to the <strong>Appointments</strong> section to view all scheduled,
            completed, and canceled appointments. You can{" "}
            <strong>update appointment status</strong> as needed:
            <ul className="list-disc ml-6 mt-2">
              <li>Mark as <strong>Completed</strong> after a session ends.</li>
              <li>Change to <strong>Cancelled</strong> if the patient misses it.</li>
              <li>Set <strong>Scheduled</strong> for upcoming visits.</li>
            </ul>
          </>
        ),
      },
      {
        icon: Video,
        title: "4. Manage Stimuli Library",
        color:
          "text-purple-600 border-purple-600 bg-purple-500/10 dark:text-purple-400 dark:border-purple-400",
        description: (
          <>
            Use the <strong>Stimuli Library</strong> to upload, edit, or delete
            therapeutic videos. These videos are used during assessment sessions
            to engage autistic babies based on their specific developmental needs.
            You have full <strong>CRUD control</strong> over the library:
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Create</strong> – Upload new video stimuli.</li>
              <li><strong>Read</strong> – Preview and browse the existing library.</li>
              <li><strong>Update</strong> – Edit metadata or replace content.</li>
              <li><strong>Delete</strong> – Remove outdated or irrelevant videos.</li>
            </ul>
          </>
        ),
      },
    ];
  
    const dashboardFeatures = [
      {
        icon: Users,
        title: "View & Manage Patients",
        description:
          "View all registered patients, access detailed profiles, and monitor their assessment progress over time.",
        cardColor:
          "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
        iconColor:
          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      },
      {
        icon: FileText,
        title: "Assessment Reports",
        description:
          "Access auto-generated assessment summaries and visual insights for each patient.",
        cardColor:
          "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
        iconColor:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      },
      {
        icon: Video,
        title: "Stimuli Library (CRUD)",
        description:
          "Upload, update, or remove therapeutic videos tailored to patient needs. Maintain a structured stimuli library.",
        cardColor:
          "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
        iconColor:
          "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      },
      {
        icon: Calendar,
        title: "Appointments Management",
        description:
          "Schedule, complete, or cancel appointments easily. Keep the patient visit records up to date.",
        cardColor:
          "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
        iconColor:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      },
    ];
  
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-12">
          {/* Doctor Dashboard - Key Features */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-800">
            <CardContent className="p-6 md:p-8 space-y-10">
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Doctor Dashboard Features
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {dashboardFeatures.map((feature, index) => (
                    <Card
                      key={index}
                      className={`shadow-lg border ${feature.cardColor} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <CardHeader className="flex flex-col space-y-3 p-5">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center ${feature.iconColor} shadow-inner`}
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
            </CardContent>
          </Card>
  
          {/* Doctor Workflow / Step-by-Step Guide */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-800">
            <CardContent className="p-6 md:p-8 space-y-10">
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Step-by-Step Doctor Workflow
                </h2>
  
                {/* Preparation Note */}
                <div className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg shadow-inner">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      Quick Setup Tips
                    </h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-400 text-sm list-disc pl-5">
                    <li>
                      Ensure all patient data is verified and correctly linked to their
                      assessment records.
                    </li>
                    <li>
                      Keep your stimuli videos organized with descriptive titles and
                      patient age groups.
                    </li>
                  </ul>
                </div>
  
                {/* Doctor Workflow Timeline */}
                <div className="relative pt-2">
                  <div className="absolute left-6 top-0 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
  
                  {steps.map((step, index) => (
                    <div key={index} className="flex mb-8 last:mb-0 items-start group">
                      <div className="relative flex-shrink-0 z-10">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.color} border-4 border-card shadow-md group-hover:scale-105`}
                        >
                          <step.icon
                            className={`h-5 w-5 ${step.spin ? "animate-spin" : ""}`}
                          />
                        </div>
                      </div>
  
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
  