import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png'

function LoginPage() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post("http://192.168.1.9:8080/Login", { name:username, password });
          
console.log(res.data)



if(res.data === "Login Success"){


    localStorage.setItem('successResponse',res.data)
  navigate("/dashboard");
}
       else {
 setError(err.response?.data?.message || "Login failed");
       }
          
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

// const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // Simulate login without API
//     try {
//         const mockToken = "mock-token";
//         // const mockUser = { name: "Test User", email };

//         localStorage.setItem("successResponse", mockToken);
//         // localStorage.setItem("user", JSON.stringify(mockUser));
//         navigate("/dashboard");
//     } catch (err) {
//         setError("Login failed");
//     } finally {
//         setLoading(false);
//     }
// };

    return (
        <div className="flex items-center justify-center min-h-screen  transition-colors duration-300">
            <form onSubmit={handleSubmit} className="p-6 bg-white  w-[400px]">
                <img src={logo} alt=""  className="px-10 w-full "/>
                <h2 className="text-2xl font-bold my-4 text-blue-500 text-center ">Login</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <div>
                    <label htmlFor="" className="text-[#7D8592] font-medium mb-4">Username</label>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full mb-6 p-3 mt-2 border rounded-lg text-gray-900  shadow-[#B8C8E039] shadow-sm  border-gray-300 "
                    required
                />
                </div>
               <div>
        <label htmlFor="" className="text-[#7D8592] font-medium mb-4">Password</label>
                 <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-6 p-3 mt-2 border rounded-lg text-gray-900  shadow-[#B8C8E039] shadow-sm  border-gray-300 "
                    required
                />
               </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg transition-colors shadow-[#B8C8E039] shadow-sm ${
                        loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    } text-white`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
