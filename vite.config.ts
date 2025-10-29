import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise the warning threshold a bit and add manual chunking to avoid
    // extremely large single chunks after minification.
    chunkSizeWarningLimit: 1000, // in KB
    rollupOptions: {
      output: {
        // Manual chunking: put large dependencies into separate chunks so
        // they can be cached independently and keep app chunks small.
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            // Separate React and ReactDOM
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            // Supabase client
            if (id.includes("@supabase") || id.includes("supabase")) {
              return "vendor-supabase";
            }
            // Paystack, form libraries, and large UI deps
            if (
              id.includes("@paystack") ||
              id.includes("formik") ||
              id.includes("yup") ||
              id.includes("react-select")
            ) {
              return "vendor-payments-and-forms";
            }
            // GSAP and animation libs
            if (id.includes("gsap")) {
              return "vendor-gsap";
            }
            // All other node_modules into a generic vendor chunk
            return "vendor";
          }
        },
      },
    },
  },
});
