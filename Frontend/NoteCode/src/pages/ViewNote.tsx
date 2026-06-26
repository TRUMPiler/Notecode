import CustomEditor from '@/components/custom-editor/CustomEditor'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import '../styles/titlebar.scss'
import { getNote, updateNote } from '../services/notesApi';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { fetchNoteById, clearCurrentNote, fetchNotesTitles } from './notesSlice';
const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:6066';

const ViewNote = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toastref = useRef<Toast | null>(null);
  
  const [text, setTextState] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [privatee, setPrivatee] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const lastSavedData = useRef<{ title: string; text: string | null; privatee: boolean }>({ title: '', text: null, privatee: true });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { currentNote, currentNoteStatus } = useSelector((state: RootState) => state.notes);
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);

  // Fetch note details on component mount
  useEffect(() => {
    if (!id) return;
    dispatch(fetchNoteById(id));

    return () => {
      dispatch(clearCurrentNote()); // Clear the note on unmount
    };
  }, [id, dispatch]);

  // Sync Redux state to local component state when note is successfully fetched
  useEffect(() => {
    if (currentNoteStatus === 'succeeded' && currentNote) {
      setTitle(currentNote.title || '');
      setTextState(currentNote.content || '');
      setPrivatee(currentNote.private ?? true);
      lastSavedData.current = {
        title: currentNote.title || '',
        text: currentNote.content || '',
        privatee: currentNote.private ?? true,
      };
      setIsLoading(false);
    } else if (currentNoteStatus === 'failed') {
      setIsLoading(false);
      toastref.current?.show({ severity: 'error', summary: 'Fetch Failed', detail: 'Could not load the note. It may be private or deleted.', life: 3000 });
    } else if (currentNoteStatus === 'loading' || currentNoteStatus === 'idle') {
      setIsLoading(true);
    }
  }, [currentNote, currentNoteStatus]);

  // Handle clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Auto-save effect
  useEffect(() => {
    if (isLoading || text === null) return;

    const hasChanged =
      title !== lastSavedData.current.title ||
      text !== lastSavedData.current.text ||
      privatee !== lastSavedData.current.privatee;

    if (!hasChanged) return;

    setAutoSaveStatus('Unsaved changes...');

    const timeoutId = setTimeout(async () => {
      if (!isLoggedIn) {
        setAutoSaveStatus('Login to auto-save');
        return;
      }
      
      setAutoSaveStatus('Saving...');
      try {
        if (id) {
          await updateNote(id, { title, content: text, private: privatee });
          lastSavedData.current = { title, text, privatee };
          setAutoSaveStatus('Saved');
          if (user?.email) {
            dispatch(fetchNotesTitles(user.email));
          }
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('Error auto-saving');
      }
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(timeoutId);
  }, [text, title, privatee, isLoading, id, isLoggedIn, dispatch, user?.email]);

  // Handle Updating
  const onUpdateHandler = async () => {
    if (!title || !text) {
      toastref.current?.show({ severity: 'warn', summary: 'Content Required', detail: 'Title and content cannot be empty.', life: 3000 });
      return
    }

    if (!isLoggedIn) {
      toastref.current?.show({ severity: 'info', summary: 'Login Required', detail: 'Please login to update this note.', life: 3000 });
      return;
    }

    setIsSaving(true);
    setAutoSaveStatus('Saving...');
    try {
      if (id) {
        await updateNote(id, { title, content: text, private: privatee });
        lastSavedData.current = { title, text, privatee };
        setAutoSaveStatus('Saved');
        toastref.current?.show({ severity: 'success', summary: 'Note Updated', detail: 'Your note has been updated successfully.', life: 3000 });
        if (user?.email) {
          dispatch(fetchNotesTitles(user.email));
        }
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toastref.current?.show({ severity: 'error', summary: 'Update Failed', detail: 'Failed to update note. You might not have permission.', life: 3000 });
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${BACKEND_URL}/notes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        if (user?.email) {
          dispatch(fetchNotesTitles(user.email));
        }
        toastref.current?.show({ severity: 'success', summary: 'Note Deleted', detail: 'Redirecting to homepage...', life: 2000 });
        setTimeout(() => navigate('/'), 2000);
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'You may not have permission to delete this note.';
        toastref.current?.show({ severity: 'error', summary: 'Delete Failed', detail: errorMessage, life: 3000 });
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      toastref.current?.show({ severity: 'error', summary: 'Delete Failed', detail: 'An unexpected error occurred.', life: 3000 });
    }
  };

  const confirmDelete = () => {
    confirmDialog({
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: handleDelete
    });
  };

  return (
    <div className='flex flex-col justify-center min-h-screen w-full dark:bg-black bg-linear-to-r from-pink-200 to-gray-100 dark:from-gray-800 dark:to-gray-900'>
      <Toast ref={toastref} />
      <ConfirmDialog />
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl font-semibold dark:text-white">Loading note...</div>
        </div>
      ) : (
        <>
          <div className='flex justify-between px-7 py-2 mt-20'>
            <button className='bg-gray-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-gray-600 transition-all duration-300' onClick={() => navigate('/')}>
              Back
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {autoSaveStatus}
              </span>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="px-2 py-1.5 sm:py-2 bg-gray-200 hover:bg-black hover:text-white dark:bg-gray-700 dark:hover:bg-gray-600 border border-black/30 dark:border-gray-600 rounded-lg transition flex items-center justify-center shrink-0"
                  aria-label="Options"
                >
                  <span className="font-bold text-lg leading-none -mt-1 dark:text-white">&#8942;</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 flex flex-col py-1">
                    <button
                      onClick={() => { onUpdateHandler(); setShowMenu(false); }}
                      disabled={isSaving}
                      className="px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Updating...' : 'Update Note'}
                    </button>
                    <button
                      onClick={() => { confirmDelete(); setShowMenu(false); }}
                      className="px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Delete Note
                    </button>
                    <button
                      onClick={() => { alert('Share functionality coming soon!'); setShowMenu(false); }}
                      className="px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Share Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className='flex flex-row items-center justify-center w-full gap-9'>
            <div className='title-container'>
              <InputText className="title-input" placeholder="Enter title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 dark:text-white">
              Private
              <InputSwitch checked={privatee} onChange={(e) => setPrivatee(e.value)} className="p-inputswitch-sm" />
            </div>
          </div>
          
          <div className='flex flex-col items-center justify-center w-full mt-4'>
            {text !== null && <CustomEditor key={id} setText={setTextState} text={text} />}
          </div>
        </>
      )}
    </div>
  )
}

export default ViewNote;