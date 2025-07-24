import { useState, useEffect } from "react";
import "./App.css";
import { SidebarProvider,SidebarTrigger } from "./components/ui/sidebar";
import SidebarGG from "./SidebarGG";

import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import Routing from "./Pages/Routing";
import { Toaster } from "./components/ui/sonner";
function App() {
const [collapsed, setCollapsed] = useState(false);
const location = useLocation();
  // Retrieve the initial sidebar state from cookies
  useEffect(() => {
    const cookieState = Cookies.get("sidebar-collapsed");
    setCollapsed(cookieState === "true");
  }, []);

  // Toggle sidebar and save state in cookies
  const toggleSidebar = (open: boolean) => {
    setCollapsed(!open);
    Cookies.set("sidebar-collapsed", (!open).toString(), { path: "/" });
  };
  const noSidebarRoutes = ["/Login", "/Registration"];

  const isSidebarVisible = !noSidebarRoutes.includes(location.pathname);
  return (
    <>
    <Toaster position="top-center" richColors/>
      {isSidebarVisible ? (
        <SidebarProvider
          defaultOpen={!collapsed}
          open={!collapsed}
          onOpenChange={(open) => toggleSidebar(open)}
        >
          <SidebarGG />
          <SidebarTrigger />
          <Routing />
        </SidebarProvider>
        
      ) : (
        <Routing />
      )}
    </>
  );
}


export default App;
