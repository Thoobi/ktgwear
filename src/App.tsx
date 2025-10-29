import { RouterProvider } from "react-router-dom";
import routes from "./routes";
import { CartProvider } from "./components/context/cart_context";
import AuthProvider from "./components/context/auth_provider";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" expand richColors />
        <RouterProvider router={routes} />
      </CartProvider>
    </AuthProvider>
  );
}
export default App;
