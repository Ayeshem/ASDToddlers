import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useChildrenStore } from "@/store/childrenStore";
import { useAuthStore } from "@/store/authStore";
import type { Child as ApiChild } from "@/services/childrenApi";
import { useStimuliStore } from "@/store/stimuliStore";
import { useAssessmentStore } from "@/store/assessmentStore";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Square, Eye, Clock, X, AlertCircle } from "lucide-react";
import { gazeApi, type SessionStatus, type GazeResult } from "@/services/gazeApi";
import type { GazeData, SessionData } from "@/types";

export default function GazeSession() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedStimulusId, setSelectedStimulusId] = useState<string>("");
  const [gazePoints, setGazePoints] = useState<GazeData[]>([]);
  const [backendProcessing, setBackendProcessing] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);

  const children = useChildrenStore(state => state.children);
  const fetchChildren = useChildrenStore(state => state.fetchChildren);
  const getChildById = useChildrenStore(state => state.getChildById);
  const user = useAuthStore(state => state.user);
  const { stimuli, fetchStimuli } = useStimuliStore();
  const { addAssessment } = useAssessmentStore();

  const child = children.find(c => c.id === childId);
  const [localChild, setLocalChild] = useState<ApiChild | null>(null);
  const resolvedChild = child || localChild;
  const selectedStimulus = stimuli.find(s => s.id === selectedStimulusId);
  const selectedStimulusDurationSec = selectedStimulus?.duration
    ? parseInt(selectedStimulus.duration, 10)
    : 0;

  useEffect(() => {
    // Auto-select first stimulus if available
    if (stimuli.length > 0 && !selectedStimulusId) {
      setSelectedStimulusId(stimuli[0].id);
    }
  }, [stimuli, selectedStimulusId]);

  // Ensure stimuli are loaded when visiting this page directly
  const stimuliFetchedRef = useRef(false);
  const stimuliFetchingRef = useRef(false);
  useEffect(() => {
    if (!stimuliFetchedRef.current && !stimuliFetchingRef.current && (!stimuli || stimuli.length === 0)) {
      console.log('Fetching stimuli - should only happen once');
      stimuliFetchedRef.current = true;
      stimuliFetchingRef.current = true;
      void fetchStimuli().finally(() => {
        stimuliFetchingRef.current = false;
      });
    }
  }, []); // Empty dependency array - only run once

  // Ensure children list is loaded when visiting this page directly
  const childrenFetchedRef = useRef(false);
  const childrenFetchingRef = useRef(false);
  useEffect(() => {
    if (!childrenFetchedRef.current && !childrenFetchingRef.current && (!children || children.length === 0) && user?.id) {
      childrenFetchedRef.current = true;
      childrenFetchingRef.current = true;
      void fetchChildren(user.id).finally(() => {
        childrenFetchingRef.current = false;
      });
    }
  }, [user?.id]); // Only depend on user?.id

  // If navigating directly and child list is empty, fetch single child by id
  const childFetchedRef = useRef(false);
  useEffect(() => {
    if (!childFetchedRef.current && !child && childId) {
      childFetchedRef.current = true;
      void (async () => {
        const fetched = await getChildById(childId);
        if (fetched) {
          setLocalChild(fetched);
        }
      })();
    }
  }, [childId]); // Only depend on childId

  // Poll backend status only while finalizing, pause when tab hidden
  const navigatedRef = useRef(false);
  const pollTimeoutRef = useRef<number | null>(null);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(typeof document !== 'undefined' ? !document.hidden : true);

  useEffect(() => {
    const onVisibility = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const clearPoll = () => {
      if (pollTimeoutRef.current !== null) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    if (!backendProcessing || !isPageVisible) {
      clearPoll();
      return () => {};
    }

    const poll = async () => {
      try {
        const status = await gazeApi.getSessionStatus();
        setSessionStatus(status);
        if (!status.processing) {
          setBackendProcessing(false);
          setIsRecording(false);
          if (!navigatedRef.current && resolvedChild?.id) {
            navigatedRef.current = true;
            toast({ title: 'Processing completed', description: 'Fetching assessment results...' });
            navigate(`/reports/${resolvedChild.id}`);
            return; // stop scheduling further polls
          }
        }
      } catch (error) {
        console.error('Failed to get session status:', error);
      } finally {
        if (backendProcessing && isPageVisible && !navigatedRef.current) {
          pollTimeoutRef.current = window.setTimeout(poll, 3000);
        }
      }
    };

    // kick off immediately
    pollTimeoutRef.current = window.setTimeout(poll, 0);
    return clearPoll;
  }, [backendProcessing, isPageVisible, navigate, toast, resolvedChild?.id]);

  // UI timer effect (separate from backend processing)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const startSession = async () => {
    if (!selectedStimulus || !resolvedChild) return;
    if (isRecording || backendProcessing) return;

    try {
      // Start session with Flask backend
      const response = await gazeApi.startSession({
        child_id: resolvedChild.id,
        stimulus_id: selectedStimulus.id,
        session_type: "default"
      });

      const newSession: SessionData = {
        sessionId: Date.now().toString(),
        childId: resolvedChild.id,
        stimulusId: selectedStimulus.id,
        startTime: new Date().toISOString(),
        gazeData: [],
        isActive: true,
      };

      setSessionData(newSession);
      setIsRecording(true);
      setBackendProcessing(false); // poll only after stop
      setElapsedTime(0);
      setGazePoints([]);
      
      toast({
        title: "Session started",
        description: "Backend gaze tracking pipeline is running...",
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      toast({
        title: "Error",
        description: "Failed to start gaze tracking session. Check if backend is running.",
        variant: "destructive",
      });
    }
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "UI resumed" : "UI paused",
      description: "Note: Backend processing continues",
    });
  };

  const endSession = async () => {
    if (!resolvedChild) return;
  
    try {
      // Tell backend to stop main.py
      await gazeApi.stopSession(); // ✅ Make sure this sends POST to /stop
      toast({
        title: "Session ended",
        description: "Gaze tracking session terminated and processing started.",
      });
    } catch (error) {
      console.error("Failed to stop session:", error);
      toast({
        title: "Error",
        description: "Failed to properly stop the session.",
        variant: "destructive",
      });
    }
  // Reset UI state
  setSessionData(null);
  setIsRecording(false);
  setIsPaused(false);
  setElapsedTime(0);
  setGazePoints([]);
  setBackendProcessing(true); // ✅ Keep checking for result via /status

  // The polling `useEffect` will detect when processing ends and navigate to /reports/:childId
};  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!resolvedChild) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Loading child...</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <X className="h-4 w-4 mr-2" />
              Exit
            </Button>
            <div>
              <h1 className="text-xl font-bold">Gaze Tracking Session</h1>
              <p className="text-sm text-muted-foreground">{resolvedChild.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
            
            {backendProcessing && (
              <div className="flex items-center gap-1 text-sm text-risk-high">
                <div className="w-2 h-2 bg-risk-high rounded-full animate-pulse" />
                <span>Processing</span>
              </div>
            )}
            
            {isRecording && !backendProcessing && (
              <div className="flex items-center gap-1 text-sm text-risk-moderate">
                <AlertCircle className="h-4 w-4" />
                <span>UI Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {!isRecording ? (
          /* Setup Screen */
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Session Setup</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Video Stimulus
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {stimuli.map((stimulus) => (
                        <div
                          key={stimulus.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedStimulusId === stimulus.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedStimulusId(stimulus.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              Video
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{stimulus.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {stimulus.category}{' '}
                                {stimulus.duration ? `• ${Math.floor(parseInt(stimulus.duration, 10) / 60)}m` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                   <div className="pt-4">
                    <Button
                      onClick={startSession}
                       disabled={!selectedStimulus || isRecording || backendProcessing}
                      className="w-full"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Gaze Tracking Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Session Screen */
          <div className="space-y-6">
            {/* Stimulus Display Area */}
            <Card className="mx-auto max-w-4xl">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {<video
                    className="w-full h-full object-cover"
                    src={selectedStimulus?.video_url}
                    controls
                    autoPlay
                    onEnded={endSession}
                  />}
                  
                  
                  {/* Mock gaze overlay points */}
                  {gazePoints.slice(-10).map((point, index) => (
                    <div
                      key={index}
                      className="absolute w-4 h-4 bg-risk-high rounded-full opacity-60 transform -translate-x-2 -translate-y-2"
                      style={{
                        left: `${(point.x / 1920) * 100}%`,
                        top: `${(point.y / 1080) * 100}%`,
                      }}
                    />
                  ))}
                  
                  {/* Live gaze indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 text-white bg-black/50 px-3 py-1 rounded">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Live Tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress and Controls */}
            <Card className="mx-auto max-w-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Session Progress</span>
                      <span>{formatTime(elapsedTime)} / {formatTime(selectedStimulusDurationSec)}</span>
                    </div>
                    <Progress
                      value={(elapsedTime / (selectedStimulusDurationSec || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={pauseSession}
                      size="lg"
                    >
                      {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    
                    <Button
                      onClick={endSession}
                      size="lg"
                      className="bg-risk-high hover:bg-risk-high/90"
                    >
                      <Square className="h-5 w-5 mr-2" />
                      End Session
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground">Gaze Points</p>
                      <p className="text-lg font-semibold">{gazePoints.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fixations</p>
                      <p className="text-lg font-semibold">{Math.floor(gazePoints.length / 10)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quality</p>
                      <p className="text-lg font-semibold text-risk-low">Good</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}