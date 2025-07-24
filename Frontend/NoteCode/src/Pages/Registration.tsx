import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster, toast, ToastClassnames } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import GoogleRegisterButton from './SubParts/GoogleRegisterButton';
import axios from 'axios';
import Cookies from "js-cookie";
const Registration = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log(formData);
        if (formData.password !== formData.confirmPassword) {
            toast.error("Password and Confirm Password do not match.", { className: "error" });
            return;
        }

        console.log("Form Data:", formData);
        await axios.post('http://localhost:3000/user/register', formData, { headers: { "Content-Type": "application/json" } }).then((res) => {
            if (res.data.sucess == true) {

                toast.success("Registration Successfull!!", { className: "success" });
                Cookies.set("userId", res.data.user.id);
        Cookies.set("name", res.data.user.name);
        Cookies.set("email", formData.email);
        Cookies.set("avatar", res.data.user.image??"https://github.com/shadcn.png");
                setTimeout(() => {
                    window.location.href = "/HomePage";
                }, 1000);
            }

            else {
                toast.error("Registration Failed", { className: "error" }); console.log(res.data.message);
            }
        }).catch((err) => {
            console.log(err);
            if (err.response!=undefined&& err.response.data.message == "User Already exists") {
                toast.error("You are already Registered in Our Platform, Please Login", { className: "error" });
            }
            else {
                toast.error("Registration Failed", { className: "error" });

            }
        });
    };

    return (

        <form onSubmit={handleSubmit}>
            <Card className="mx-auto max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Register</CardTitle>
                    <CardDescription>Create an account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                required
                                onChange={handleChange}
                            />
                        </div>
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
                                placeholder="Password"
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </div>
                    <GoogleRegisterButton />
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center space-y-2">
                    <div>
                        <Label className="text-center">Already have an account?</Label>
                    </div>
                    <Button type="button" variant="outline" className="w-full" onClick={() => { window.location.href = "/Login" }}>
                        Login
                    </Button>

                </CardFooter>
            </Card>
        </form>
    );
};

export default Registration;
