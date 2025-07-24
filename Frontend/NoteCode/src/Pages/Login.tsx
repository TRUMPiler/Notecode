import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "@/components/ui/button"
import { Toaster, toast, ToastClassnames } from 'sonner';
import axios from "axios";
import { useState } from "react";
import Cookies from "js-cookie";
import GoogleLoginButton from "./SubParts/GoogleLoginButton";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/user/login",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.sucess == true||response.data.success== true) {
        
        toast.success("Login Successful! Welcome back!", { className: "success" });
        Cookies.set("userId", response.data.user.id);
        Cookies.set("name", response.data.user.name);
        Cookies.set("email", formData.email);
        Cookies.set("avatar", response.data.user.image??"https://github.com/shadcn.png");
        setTimeout(() => {
          window.location.href = "/HomePage"; // Redirect to the dashboard or home page
        }, 1000);
      } else {
        toast.error(response.data.message || "Login Failed", { className: "error" });
      }
    } catch (error: any) {
      console.log(error);
      if(error.response.data.message==="User is not logged in with google account") { toast.error(error.response.data.message, { className: "error" });
    }
    else
    {
      toast.error("Login Failed", { className: "error" });
    }
  };
}
  return (
    <form onSubmit={handleSubmit}>
    
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email and password to log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <GoogleLoginButton />
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <div>
            <Label className="text-center">Don't have an account?</Label>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/Registration";
            }}
            className="w-full"
          >
            Register
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default Login