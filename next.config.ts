import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Ensure drill-generator knowledge doc is available to the API route at runtime.
  outputFileTracingIncludes: {
    "/api/admin/generate-drill": [
      "./knowledge/drills/drill-generation-and-validation.md",
    ],
  },
};

export default nextConfig;
