// src/Tiptap.tsx
import CustomEditor from '@/components/custom-editor/CustomEditor'
import { useState, useEffect, useRef } from 'react'

import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext'

import '../styles/titlebar.scss'
import { InputSwitch } from 'primereact/inputswitch';
import { useNavigate } from 'react-router-dom';
import { createNote } from '../services/notesApi';
import { Toast } from 'primereact/toast';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { fetchNotesTitles } from './notesSlice';


const Tiptap = React.memo(() => {
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const toastref=useRef<Toast|null>(null);
  const [text, setTextState] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('')
  const [privatee, setPrivatee] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if(title==""||title==null)
    {
      setTitle("Untitled Note");
    }
    const draft = localStorage.getItem('draftNote');
    if (draft) {
      try {
        console.log('Found draft note in localStorage:', draft);
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.title) setTitle(parsedDraft.title);
        if (parsedDraft.content) setTextState(parsedDraft.content);
        if (parsedDraft.private !== undefined) setPrivatee(parsedDraft.private);
        localStorage.removeItem('draftNote');
      } catch (err) {
        console.error('Failed to parse draft note:', err);
      }
    }
  }, []);

  const onSubmitHandler = async () => {
    if (!title || !text||title.trim() === '' || text.trim() === '') {
      toastref.current?.show({severity:'warn', summary:'Content Required', detail:'Title and content cannot be empty.', life:3000});
      console.log("Title or content is empty. Submission aborted.");
      return
    }

    if (!isLoggedIn) {
      localStorage.setItem('draftNote', JSON.stringify({ title, content: text, private: privatee }));
      toastref.current?.show({severity:'info', summary:'Login Required', detail:'Please login to save your note. Redirecting...', life:3000});
      setTimeout(() => {
      navigate('/auth');
      }, 3000);
      return;
    }

    setIsSaving(true);
    try {
      await createNote({ title, content: text, private: privatee });
      toastref.current?.show({severity:'success', summary:'Note Saved', detail:'Your note has been saved successfully.', life:3000});
      if (user?.email) {
        dispatch(fetchNotesTitles(user.email));
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      toastref.current?.show({severity:'error', summary:'Save Failed', detail:'Failed to save note. Please try again.', life:3000});
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <div className='flex flex-col justify-center min-h-screen w-full dark:bg-black bg-linear-to-r from-pink-200 to-gray-100 dark:from-gray-800 dark:to-gray-900'>
      <Toast ref={toastref} />
      <div className='flex justify-between px-7 py-2 mt-20'>
        <button></button>
        <button className='bg-linear-to-r max-w-fit from-blue-500 to-blue-700 text-white rounded-lg px-4 py-2 font-semibold transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl active:scale-115 dark:border-2 dark:border-blue-400' onClick={onSubmitHandler} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Submit'}
        </button>
      </div>
      <div className='flex flex-row items-center justify-center w-full gap-9 '>

        <div className='title-container'>

          <InputText
            className="title-input"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 dark:text-white">
          Private
          <InputSwitch checked={privatee} onChange={(e) => setPrivatee(e.value)} className="p-inputswitch-sm" />
        </div>
      </div>
      <div className='flex flex-col items-center justify-center w-full mt-4'>
        <CustomEditor
          setText={setTextState}
          text={text}
          
        />
      </div>
      {/* <div>
        <h2 className='text-2xl font-bold mt-8 mb-4'>Output:</h2>
        <div className='bg-gray-100 p-4 rounded-lg shadow-md'>
          <pre className='whitespace-pre-wrap wrap-break-word'>{text}</pre>
        </div>
      </div>     */}
    </div>
  )
})

export default Tiptap