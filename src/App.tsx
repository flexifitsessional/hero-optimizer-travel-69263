import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import GymSearch from "./pages/GymSearch";
import GymDetails from "./pages/GymDetails";
import MyBookings from "./pages/MyBookings";
import Favorites from "./pages/Favorites";
import GymOwner from "./pages/GymOwner";
import AddGym from "./pages/AddGym";
import GymStats from "./pages/GymStats";
import BookingHistory from "./pages/BookingHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/search" element={<GymSearch />} />
          <Route path="/gym/:id" element={<GymDetails />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/gym-owner" element={<GymOwner />} />
          <Route path="/add-gym" element={<AddGym />} />
          <Route path="/gym-stats/:id" element={<GymStats />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
