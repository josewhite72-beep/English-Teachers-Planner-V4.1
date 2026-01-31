import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import PreviewPage from "@/pages/PreviewPage";
import { PlannerProvider } from "@/context/PlannerContext";
import "@/App.css";

function App() {
  return (
    <PlannerProvider>
      <div className="App min-h-screen bg-slate-50">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/preview" element={<PreviewPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </PlannerProvider>
  );
}

export default App;
