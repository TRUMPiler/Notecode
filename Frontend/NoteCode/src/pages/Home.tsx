// import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";


const Home = () => {
    const navigate = useNavigate()
    const BtnLGShandler = () => {
        navigate("/editor")
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">Welcome to NoteCode</h1>
            <p className="text-lg text-gray-600 mb-8">Your personal note-taking app for code snippets and ideas.</p>
            <button  className="px-10 py-7 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200" onClick={BtnLGShandler} >Get Started</button>
            {/* <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">Get Started</button> */}
        </div>
    )
}
export default Home;