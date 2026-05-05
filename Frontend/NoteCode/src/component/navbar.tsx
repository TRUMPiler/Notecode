const Navbar = () => {
  return (
    <nav className="flex flex-row justify-between items-center p-4 bg-blue-300">   
        <div className="text-3xl text-blue-700">NoteCode</div>
        <ul className="flex flex-row space-x-4">
            <li><a href="#">Home</a></li>
            {/* <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li> */}
        </ul>
    </nav>
  )
}

export default Navbar;