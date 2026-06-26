import { useNavigate } from 'react-router-dom';
import RichCrane from '../assets/rich-crane.png';
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-4">
      <img 
        src={RichCrane} 
        alt="Rich Crane" 
        className="w-64 h-64 object-contain mb-6 drop-shadow-lg" 
      />
      {/* <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1> */}
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        The note or page you are looking for doesn't exist, or you don't have permission to view it.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-300 shadow-md"
      >
        Return to Home
      </button>
    </div>
  );
}