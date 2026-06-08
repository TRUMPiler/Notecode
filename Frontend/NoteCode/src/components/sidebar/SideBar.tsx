import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import axios from "axios";
import { useEffect, useState } from "react";

export function AppSidebar() {
  const [notesTitles, setNotesTitles] = useState<string[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      console.log("User not logged in. Skipping fetch of notes titles.");
      return;
    }

    console.log("User is logged in. Fetching notes titles...");

    const fetchNotesTitles = async () => {
      try {
        const parsedUser = JSON.parse(user);

        const response = await axios.get("/api/notes/titles", {
          params: {
            email: parsedUser.email, // Use actual user email
          },
        });

        console.log("Fetched notes titles:", response.data.titles);

        setNotesTitles(response.data.titles || []);
      } catch (error) {
        console.error("Error fetching notes titles:", error);
      }
    };

    fetchNotesTitles();
  }, []);

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">My Notes</h2>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <label className="text-sm font-medium text-gray-500">
            All Notes
          </label>
        </SidebarGroup>

        <SidebarGroup>
          {notesTitles.length === 0 ? (
            <p className="text-sm text-gray-500">
              No notes found. Create your first note!
            </p>
          ) : (
            notesTitles.map((title, index) => (
              <p key={index} className="text-sm text-gray-500">
                {title}
              </p>
            ))
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-sm text-gray-500">© 2026 NoteCode</p>
      </SidebarFooter>
    </Sidebar>
  );
}