import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/exercises",
        destination: "/drills",
        permanent: true,
      },
      {
        source: "/exercises/:id",
        destination: "/drills/:id",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  // Ensure drill-generator knowledge docs are available to the API route at runtime.
  outputFileTracingIncludes: {
    "/api/admin/generate-drill": [
      "./knowledge/drills/drill-generation-and-validation.md",
      "./knowledge/skills/*.md",
    ],
  },
};

export default nextConfig;
