import React from "react";
import { SidebarGroup,SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../../components/ui/sidebar";
import Cookies from "js-cookie";
import axios from "axios";
import { useEffect, useState,useCallback } from "react";
import { ScrollArea } from "../../components/ui/scroll-area"

import { PenIcon } from "lucide-react";
const NoteTitles = () => {
        type Note = {
        Title: string;
        code: string;
        date: string;
        _id:number;
    }
    const [userid, setuserid] = useState("");
    const [note, setnote] = useState<Note[]>([]);
     const GetNoteTitle = useCallback(async () => {
        try {
            const userId = Cookies.get("userId") ?? "";
            setuserid(userId); // Ensure state is updated with userId
            const response = await axios.post('http://localhost:3000/note/getall', {
                "userId": userId
            }, {
                headers: { "Content-Type": "application/json" },
            }
            );
            console.log(response.data);
            setnote(response.data);
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    }, []);
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            GetNoteTitle();
        }
        return () => {
            isMounted = false;
        };
    }, []);
    return (
   <SidebarGroup>
   <SidebarGroupLabel>Notes</SidebarGroupLabel>
   <SidebarGroupContent>
   <SidebarMenu>
   <ScrollArea>
   {note.map((note) => (
    
    <SidebarMenuItem key={note._id}>
    
      <SidebarMenuButton> <PenIcon/> {note.Title}</SidebarMenuButton>
    </SidebarMenuItem>
  ))}
   </ScrollArea>
   </SidebarMenu>
   </SidebarGroupContent>
   </SidebarGroup>  
 );   
}
export default NoteTitles;