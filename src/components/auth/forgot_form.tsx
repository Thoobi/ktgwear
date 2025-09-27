import CustomInput from "../custom/customInput";
import { Link } from "react-router-dom";
export default function ForgotPasswordForm() {
  return (
    <div className="flex flex-col gap-5 py-10 px-5 bg-gray-50 w-xl rounded-lg">
      <CustomInput
        label="Email"
        type="email"
        placeholder="Enter your associated email"
      />
      <button className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out">
        Reset Password
      </button>
      <div className="flex justify-between">
        <Link to="/account/login" className="text-base text-black underline">
          Remembered your password?
        </Link>
      </div>
    </div>
  );
}
