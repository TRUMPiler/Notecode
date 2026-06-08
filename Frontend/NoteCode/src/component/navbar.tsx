import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import {AppSidebar} from '@/components/sidebar/SideBar'


const Navbar = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, setUser } = useAuth()
  const [open, setOpen] = useState(false);
  const { state, isMobile, openMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : state === "expanded";
  const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:6066'

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      navigate('/')
    }
  }

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`${BACKEND_URL}/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.url) {
        const updateRes = await fetch(`${BACKEND_URL}/user/profile-picture`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ profilePictureUrl: uploadData.url })
        });
        
        const updateData = await updateRes.json();
        if (updateData.data?.user && setUser) {
          setUser(updateData.data.user);
          localStorage.setItem('user', JSON.stringify(updateData.data.user));
        }
      }
    } catch (err) {
      console.error('Failed to upload profile picture', err);
    }
  };

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
   
<><AppSidebar/>
<nav
  className={`fixed top-0 left-0 w-full z-50
    flex justify-between items-center p-4
    transition-all duration-500
    ${
      scrolled
        ? "backdrop-blur-md bg-white/10 dark:bg-black/10"
        : "bg-transparent"
    }
    ${isSidebarOpen ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}
  `}
>


      <div className='flex items-center space-x-4'>
        <SidebarTrigger size="lg" />
       <p className="text-3xl text-black dark:text-white cursor-pointer"  onClick={() => navigate('/')}> NoteCode</p>
      </div>
      
      <ul className="flex flex-row space-x-4 items-center">
        <li>
          <a href="/" className="text-black dark:text-white hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200">
            Home
          </a>
        </li>
        {!isLoggedIn ? (
          <>
            <li>
              {/* <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2  text-white rounded-lg "
              >
                Login
              </button> */}
            </li>
            <li>
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 bg-black dark:bg-orange-400 dark:text-white text-white rounded-4xl hover:bg-green-800 hover:scale-105 transition-all duration-200"
              >
                Register Now!
              </button>
            </li>
          </>
        ) : (
          <>
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => document.getElementById('profilePicInput')?.click()} title="Change Profile Picture">
              <AvatarImage
                src={user?.profilePictureUrl || "https://github.com/shadcn.png"}
                alt={user?.name || "User"}
              />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <input 
              type="file" 
              id="profilePicInput" 
              className="hidden" 
              accept="image/*"
              onChange={handleProfilePicUpload}
            />
            <li>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  </>
  )
}

export default Navbar