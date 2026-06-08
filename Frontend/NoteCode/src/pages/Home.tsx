// import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import VideoGif from "../assets/video.gif";
const Home = () => {
    const navigate = useNavigate()
    const BtnLGShandler = () => {
        navigate("/editor")
    }
    return (
        <div className="flex flex-col items-center justify-center dark:bg-black h-screen p-4">
            <img src={VideoGif} alt="Video Gif" className=" mb-8  mt-20 rounded-xl min-w-70vh " />
            <h1 className="text-md md:text-2xl sm:text-4xl font-bold mb-4 dark:text-orange-200">Welcome to NoteCode Universe</h1>
            <p className="text-sm md:text-lg text-justify sm:text-4xl text-gray-600 mb-8 dark:text-orange-400">Your personal note-taking app for code snippets and ideas.</p>
            <button  className="px-3 py-2 bg-pink-400 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200" onClick={BtnLGShandler} >Get Started</button>
        </div>
    )
}
export default Home;