import CustomEditor from '@/components/custom-editor/CustomEditor'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';

import '../styles/titlebar.scss'
import { useAuth } from '../context/AuthContext';
import { getNote, updateNote } from '../services/notesApi';

const ViewNote = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const toastref = useRef<Toast | null>(null);
  
  const [text, setTextState] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [privatee, setPrivatee] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const lastSavedData = useRef<{ title: string; text: string | null; privatee: boolean }>({ title: '', text: null, privatee: true });

  // Fetch note details on component mount
  useEffect(() => {
    const fetchNoteData = async () => {
      if (!id) return;
      try {
        const response = await getNote(id);
        // Depending on your API's standard response structure, access the nested note data:
        const noteData = response?.data?.note || response?.note;
        
        if (noteData) {
          setTitle(noteData.title || '');
          setTextState(noteData.content || '');
          setPrivatee(noteData.private ?? true);
          lastSavedData.current = {
            title: noteData.title || '',
            text: noteData.content || '',
            privatee: noteData.private ?? true,
          };
        }
      } catch (error) {
        console.error('Failed to fetch note:', error);
        toastref.current?.show({ severity: 'error', summary: 'Fetch Failed', detail: 'Could not load the note. It may be private or deleted.', life: 3000 });
      } finally {
        setIsLoading(false);
      }
    }

    fetchNoteData();
  }, [id]);

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
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('Error auto-saving');
      }
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(timeoutId);
  }, [text, title, privatee, isLoading, id, isLoggedIn]);

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
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toastref.current?.show({ severity: 'error', summary: 'Update Failed', detail: 'Failed to update note. You might not have permission.', life: 3000 });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className='flex flex-col justify-center min-h-screen w-full dark:bg-black bg-linear-to-r from-pink-200 to-gray-100 dark:from-gray-800 dark:to-gray-900'>
      <Toast ref={toastref} />
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl font-semibold dark:text-white">Loading note...</div>
        </div>
      ) : (
        <>
          <div className='flex justify-between px-7 py-2 mt-20'>
            <button className='bg-gray-500 text-white rounded-lg px-4 py-2 font-semibold hover:bg-gray-600 transition-all duration-300' onClick={() => navigate(-1)}>
              Back
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {autoSaveStatus}
              </span>
              <button className='bg-linear-to-r max-w-fit from-blue-500 to-blue-700 text-white rounded-lg px-4 py-2 font-semibold transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl active:scale-115 dark:border-2 dark:border-blue-400' onClick={onUpdateHandler} disabled={isSaving}>
                {isSaving ? 'Updating...' : 'Update Note'}
              </button>
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
            {text !== null && <CustomEditor setText={setTextState} text={text} />}
          </div>
        </>
      )}
    </div>
  )
}

export default ViewNote;