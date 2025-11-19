import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    APP_TWELVE_LABS_CREATORS_INDEX_ID: process.env.APP_TWELVE_LABS_CREATORS_INDEX_ID,
    APP_TWELVE_LABS_ADS_INDEX_ID: process.env.APP_TWELVE_LABS_ADS_INDEX_ID,
  },
};

export default nextConfig;
