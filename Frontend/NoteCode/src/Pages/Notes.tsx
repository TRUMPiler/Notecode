import { useState, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Cookies from "js-cookie";
import axios from "axios";

const Notes = () => {
    type Note = {
        Title: string;
        code: string;
        date: string;
        _id:number;
    }
    const [userid, setuserid] = useState("")
    const [note, setnote] = useState<Note[]>([])
    const getNotes = useCallback(async () => {
        try {
            const userId = Cookies.get("userId") ?? "";
            setuserid(userId); // Ensure state is updated with userId
            const response = await axios.post('http://localhost:3000/note/getall', {
                "userId": userId
            }, {
                headers: { "Content-Type": "application/json" },
            }
            );
            console.log(response.data);
            setnote(response.data);
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    }, []); // Empty dependency array ensures it doesn't change


    useEffect(() => {
        let isMounted = true; // Flag to ensure the effect runs only once
        if (isMounted) {
            getNotes();
        }
        return () => {
            isMounted = false; // Cleanup to avoid repeated execution
        };
    }, [getNotes]);
return (
    <>
        {note.length === 0 ? (
            <div className="flex justify-center md:mt-10 items-center h-screen">
                <p className="text-2xl font-semibold">No Notes Found</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {note.map((note) => (
                    <Card key={note._id} className="w-72 h-48 p-4 border border-cyan-300 flex flex-col overflow-hidden">
                        <CardHeader className="mb-2">
                            <CardTitle className="text-lg font-semibold truncate">{note.Title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow"><CardDescription className="text-sm text-gray-500 truncate">{note.code}</CardDescription></CardContent>
                        <CardFooter className="border-t mt-2 pt-2 text-sm text-gray-600 justify-end">
                            {note.date}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
    </>
);
}

export default Notes;