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
            <img
                src={VideoGif}
                alt="Video Gif"
                className="
                        mx-auto
                        mt-20 mb-8
                        rounded-xl
                        w-[80vw]
                        sm:w-[70vw]
                        md:w-[60vw]
                        lg:w-[50vw]
                        xl:w-[60vw]
                        max-w-[700px]
                        h-auto
                        "
            />
            <h1 className="text-md md:text-2xl sm:text-4xl font-bold mb-4 dark:text-orange-200">Welcome to NoteCenter Universe</h1>
            <p className="text-sm md:text-lg text-justify sm:text-4xl text-gray-600 mb-8 dark:text-orange-400">Your personal note-taking app for code snippets and ideas.</p>
            <button className="px-3 py-2 bg-pink-400 dark:bg-blue-600  hover:bg-pink-800 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200 " onClick={BtnLGShandler} >Get Started</button>
        </div>
    )
}
export default Home;