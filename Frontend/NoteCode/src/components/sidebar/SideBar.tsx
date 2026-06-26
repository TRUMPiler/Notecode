import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { useEffect, useRef, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../pages/store";
import { logout } from "../../context/authSlice";
import { fetchNotesTitles } from "../../pages/notesSlice";
import { Toast } from "primereact/toast";

export function AppSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef<Toast>(null);

  const notesState = useSelector((state: RootState) => state.notes);
  const notesTitles = notesState?.titles || [];
  const status = notesState?.status || "idle";
 const [view, setView] = useState<string | null>(null);
  const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:6066';
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (!user) return;
    const parsedUser = JSON.parse(user);
    dispatch(fetchNotesTitles(parsedUser.email));
  }, [dispatch, user]);

  useEffect(() => {
    if (status === "succeeded" && notesTitles.length === 0) {
      toastRef.current?.show({
        severity: "info",
        summary: "No Notes Found",
        detail: "You have no notes. Create one to get started!",
        life: 4000,
      });
    } else if (status === "failed") {
      toastRef.current?.show({
        severity: "error",
        summary: "Sync Error",
        detail: "Failed to load your notes. Please check your connection.",
        life: 4000,
      });
    }
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/view/")) {
      const noteId = currentPath.split("/view/")[1];
      setView(noteId);
    } else {
      setView(null);
    }
  }, [status, notesTitles.length, window.location.pathname]);

  const parsedUser = user ? JSON.parse(user) : null;

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/user/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      dispatch(logout());
      localStorage.removeItem("user");
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <>
      <Toast ref={toastRef} />
    <Sidebar
  side="left"
  variant="sidebar"
  collapsible="offcanvas"
  className="
    w-64
    border-r
    border-pink-200

    bg-linear-to-b
    from-white
    via-pink-50
    to-pink-100

    dark:border-[#3b2431]
    dark:bg-linear-to-b
    dark:from-[#18181b]
    dark:via-[#21111b]
    dark:to-[#2b1320]
  "
>
        {/* Header */}
        <SidebarHeader
          className="
            border-b px-5 py-4
            border-pink-100
            dark:border-[#2a1520]
          "
        >
          <div className="flex items-center justify-between">
            <h2
              className="
                cursor-pointer  text-base font-medium tracking-tight
                text-gray-900
                dark:text-gray-50
              "
              onClick={() => navigate("/")}
            >
              NoteCenter
            </h2>
            <SidebarTrigger
              className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300"
            />
          </div>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel
              className="
              flex items-center justify-between
                mb-2 px-1 text-[12px] font-bold uppercase tracking-widest
                text-pink-500
                dark:text-[#6b3a52]
              "
            > 
              📒 My Notes  <button className="text-center font-semibold text-lg cursor-pointer text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300" onClick={() => navigate('/editor')}>+</button>
            </SidebarGroupLabel>

            <SidebarGroupContent>
              {notesTitles.length === 0 ? (
                <div
                  className="
                    mx-1 rounded-xl border border-dashed p-5 text-center
                    border-pink-200 bg-white/50
                    dark:border-[#3f2030] dark:bg-transparent
                  "
                >
                  <p className="text-sm text-gray-400 dark:text-[#6b3a52]">
                    No notes yet.
                  </p>
                  <p className="mt-1 text-xs text-gray-300 dark:text-[#4a2035]">
                    Create your first note to get started.
                  </p>
                </div>
              ) : (
                <SidebarMenu className="space-y-1">
                  {notesTitles.map((note, index) => (
                    <SidebarMenuItem key={note._id || index}>
                      <SidebarMenuButton 
                      isActive={view === (note._id || "")}
                        onClick={() =>
                          note._id &&( navigate(`/view/${note._id}`)&& setView(note._id) )
                        }
                        className="
                          w-full justify-start rounded-xl
                          border-l-[3px] border-transparent
                          px-3 py-5 transition-all duration-150

                          text-gray-500 hover:border-pink-400
                          hover:bg-white/70 hover:text-gray-900

                          dark:text-[#6b7280] dark:hover:border-pink-400
                          dark:hover:bg-pink-400/10 dark:hover:text-gray-50

                          data-[active=true]:border-pink-400
                          data-[active=true]:bg-white/80
                          data-[active=true]:text-gray-900

                          dark:data-[active=true]:border-pink-400
                          dark:data-[active=true]:bg-pink-400/10
                          dark:data-[active=true]:text-gray-50
                        "
                      >
                        <span className="truncate text-sm font-medium">
                          {typeof note === "string" ? note : note.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter
          className="
            border-t px-4 py-3
            border-pink-100 bg-white/60
            dark:border-[#2a1520] dark:bg-black/40
          "
        >
          <div className="flex items-center gap-3">
            <Avatar
              className="
                size-9 cursor-pointer
                ring-2 ring-pink-200 hover:ring-pink-400
                dark:ring-pink-900 dark:hover:ring-pink-500
                transition-all
              "
              onClick={() =>
                document.getElementById("profilePicInput")?.click()
              }
              title="Change profile picture"
            >
              <AvatarImage
                src={parsedUser?.profilePictureUrl ?? "https://github.com/shadcn.png"}
                alt="Profile picture"
              />
              <AvatarFallback
                className="
                  bg-gradient-to-br from-pink-400 to-pink-600
                  text-white text-sm font-semibold
                "
              >
                {parsedUser?.name?.charAt(0).toUpperCase() ?? "N"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-50">
                {parsedUser?.name?.toUpperCase() ?? "NOTECENTER"}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-[#f5aed1]">
                © {new Date().getFullYear()} NoteCenter
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="
                ml-auto p-2 rounded-full transition-colors
                text-gray-400 hover:bg-red-100 hover:text-red-600
                dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}