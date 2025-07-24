import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarFooter,
} from "./components/ui/sidebar";
import { useTheme } from "./Pages/SubParts/ThemeProvider";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "./components/ui/switch";
import { Home, File, ChevronUp, ChevronDown,Notebook } from "lucide-react";
import { Avatar, AvatarImage,AvatarFallback } from "./components/ui/avatar";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Button } from "./components/ui/button";
import NoteTitles from "./Pages/GetTitles/NoteTitles";
const items = [
  {
    title: "Home",
    url: "/HomePage",
    icon: Home,
  },
  {
    title: "Getting Pages",
    url: "/",
    icon: File,
  },
  {
    title: "You're Notes",
    url: "/Notes",
    icon: Notebook,
  },
];

const SidebarGG = () => {
  const { open } = useSidebar();
const { theme, toggleTheme } = useTheme();
  // State for the account toggle
  const [accountToggle, setAccountToggle] = useState(false);

  // State for user authentication
  const [user, setUser] = useState<{ id?: string;email?: string; avatar?: string;name?:string } | null>(null);
  
  // Check cookies for user data
  useEffect(() => {
    const id=Cookies.get("id");
    const email = Cookies.get("email");
    const avatar = Cookies.get("avatar");
    const name=Cookies.get("name");
    console.log(avatar);
    if (email) {
      setUser({ email:email, avatar: avatar || "https://github.com/shadcn.png",name:name });
    } else {
      setUser(null);
    }
  }, []);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]" />
        {open && <SidebarHeader>NoteCode</SidebarHeader>}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NoteTitles/>      
      </SidebarContent>
      <SidebarFooter>
   <SidebarGroup>
            <SidebarGroupLabel>Theme</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <SunIcon className={theme === "light" ? "text-yellow-500" : "text-gray-500"} />
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={toggleTheme}
                                aria-label="Toggle Theme"
                            />
                            <MoonIcon className={theme === "dark" ? "text-blue-500" : "text-gray-500"} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => setAccountToggle(!accountToggle)}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} referrerPolicy={'no-referrer'}/>
                      <AvatarFallback><Skeleton className="w-[100px] h-[20px] rounded-full" /></AvatarFallback>
                    </Avatar>
                    <span className="ml-2">{user.name}</span>
                    {accountToggle ? <ChevronUp className="ml-auto" /> : <ChevronDown className="ml-auto" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span onClick={()=>{Cookies.remove("id");Cookies.remove("email");Cookies.remove("avatar");Cookies.remove("name");window.location.href = "/"}}>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem className="flex items-center">
              <a href="/Login">
                <SidebarMenuButton >
                  <Button onClick={() => {window.location.href = "/Login"}}>Login</Button>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarGG;
