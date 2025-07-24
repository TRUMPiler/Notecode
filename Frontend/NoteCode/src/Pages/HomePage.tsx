import { FormEvent, useState } from "react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import Tiptap from "./SubParts/TipTap";

import Axios from "axios";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";

const HomePage = () => {
  const userId = Cookies.get("userId");
  const [code, setCode] = useState("");
  const [title,setTitle] = useState("");

  const submitCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted");
    console.log("Code Content:", code.trim());

    if (!code.trim()) {
      toast.error("Code cannot be empty", { className: "error" });
      return;
    }

    try {
      // Uncomment and customize the Axios call as needed
      const response = await Axios.post(
        "http://localhost:3000/note/add",
        {
          code: code.trim(),
          language: "java",
          userId: userId,
          Title: title,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        toast.success("Yay! Your note has been saved.", { className: "success" });
        setTimeout(() => {
          window.location.href = "/HomePage";
        }, 1500);
      } else {
        console.log(Cookies.get("userId"));
        toast.error("Uh oh, something went wrong.", { className: "error" });
      }
    } catch (error:any) {
      console.error("Error submitting code:", error);
      toast.error("Failed to submit. Please try again.", { className: "error" });
      console.error("Error submitting code:", error.response.data);
    }
  };

  return (
    <div className="grid w-full gap-4 p-4">
      <form
        onSubmit={submitCode}
        id="CodeSubmitter"
        method="post"
        className="space-y-4"
        encType="multipart/form-data"
      >
        <Input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} required/>
        <Tiptap setCode={setCode} />
        <Button type="submit" variant="default" className="mt-4">
          Submit
        </Button>

      </form>
    </div>
  );
};

export default HomePage;
