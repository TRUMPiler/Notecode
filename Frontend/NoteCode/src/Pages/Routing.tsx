
import HomePage from "./HomePage"
import {Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import Registration from "./Registration";
import Notes from "./Notes";
const Routing = () => {
return(

<Routes>
    <Route path="/" element={<Layout/>} />
  <Route path="/HomePage" element={<HomePage />} />
  <Route path="/Login" element={<Login />} />
  <Route path="/Registration" element={<Registration />} />
  <Route path="/Notes" element={<Notes />} />
  </Routes>

  )
}
export default Routing;