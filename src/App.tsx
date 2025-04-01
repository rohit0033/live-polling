
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { PollProvider } from "@/context/PollContext";
import Welcome from "./pages/Welcome";
import StudentEntry from "./pages/StudentEntry";
import StudentPoll from "./pages/StudentPoll";
import TeacherDashboard from "./pages/TeacherDashboard";
import KickedPage from "./pages/KickedPage";
import NotFound from "./pages/NotFound";
import TeacherEntry from "./pages/TeacherEntry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PollProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/student-entry" element={<StudentEntry />} />
          <Route path="/teacher-entry" element={<TeacherEntry />} />
          <Route path="/student-poll" element={<StudentPoll />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/kicked" element={<KickedPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PollProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
