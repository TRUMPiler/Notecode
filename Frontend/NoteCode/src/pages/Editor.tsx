// src/Tiptap.tsx
import CustomEditor from '@/components/custom-editor/CustomEditor'
import { useState } from 'react'

const Tiptap = () => {
  const [text, setTextState] = useState<string|null>('')

  return (
    <div className='flex flex-col  justify-center min-h-screen w-full'>
      <div className='flex justify-between px-7 py-2'>
        <button></button>
        <button className='bg-linear-to-r max-w-fit from-blue-500 to-blue-700 text-white rounded-lg px-4 py-2 font-semibold transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl active:scale-115'>
          Submit
        </button>
      </div>
      <CustomEditor
        setText={setTextState}
        text={text}
        initialContent='<p>Hello World!</p><pre><code class="language-python">print("Hello")
print("Naisal)</code></pre><p>Hello Bhai<br></p><img src="https://res.cloudinary.com/dptltaekc/image/upload/v1779688828/asgiolkp9de5jnkpfw2x.jpg"><p><br>Tu kaha hai</p>'
      />
      <div>
        <h2 className='text-2xl font-bold mt-8 mb-4'>Output:</h2>
        <div className='bg-gray-100 p-4 rounded-lg shadow-md'>
          <pre className='whitespace-pre-wrap wrap-break-word'>{text}</pre>
        </div>
      </div>    
    </div>
  )
}

export default Tiptap