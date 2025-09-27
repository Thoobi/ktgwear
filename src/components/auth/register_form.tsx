import CustomInput from "../custom/customInput";
export default function RegisterForm() {
  return (
    <div className="flex flex-col gap-5 py-10 px-5 bg-gray-50 w-xl rounded-lg">
      <CustomInput
        label="Name"
        type="text"
        placeholder="Enter your full name"
      />
      <CustomInput label="Email" type="email" placeholder="Enter your email" />
      <CustomInput
        label="Password"
        type="password"
        placeholder="Enter your password"
      />
      <CustomInput
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
      />
      <button className="bg-black/90 cursor-pointer text-white px-8 py-2.5 text-base hover:bg-black transition-all duration-300 ease-in-out">
        Login
      </button>
      <div className="flex justify-center">
        <p className="text-base text-black">
          Already have an account?{" "}
          <a href="/account/login" className="underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
