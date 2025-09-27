import CustomInput from "../custom/customInput";
import { Link } from "react-router-dom";
export default function LoginForm() {
  return (
    <div className="flex flex-col gap-5 py-10 px-5 bg-gray-50 w-xl rounded-lg">
      <CustomInput label="Email" type="email" placeholder="Enter your email" />
      <CustomInput
        label="Password"
        type="password"
        placeholder="Enter your password"
      />
      <div className="flex justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="w-4 h-4" />
          Remember me
        </label>
        <Link to="/account/forgot" className="text-base underline">
          Forgot Password?
        </Link>
      </div>
      <button className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out">
        Login
      </button>
      <div className="flex justify-center">
        <p className="text-base text-black">
          Don't have an account?{" "}
          <a href="/account/signup" className="underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
