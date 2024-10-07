// vite.config.ts
import { resolve } from "path";
import { crx } from "file:///mnt/c/Users/sabah/101tabs/node_modules/.pnpm/@crxjs+vite-plugin@1.0.14_vite@5.2.7_@types+node@20.12.2_/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import react from "file:///mnt/c/Users/sabah/101tabs/node_modules/.pnpm/@vitejs+plugin-react-swc@3.6.0_vite@5.2.7_@types+node@20.12.2_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { defineConfig } from "file:///mnt/c/Users/sabah/101tabs/node_modules/.pnpm/vite@5.2.7_@types+node@20.12.2/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///mnt/c/Users/sabah/101tabs/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.4.3_vite@5.2.7_@types+node@20.12.2_/node_modules/vite-tsconfig-paths/dist/index.mjs";
import tailwindcss from "file:///mnt/c/Users/sabah/101tabs/node_modules/.pnpm/tailwindcss@3.4.13/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///mnt/c/Users/sabah/101tabs/node_modules/.pnpm/autoprefixer@10.4.20_postcss@8.4.47/node_modules/autoprefixer/lib/autoprefixer.js";

// src/manifest.ts
import { defineManifest } from "file:///mnt/c/Users/sabah/101tabs/node_modules/.pnpm/@crxjs+vite-plugin@1.0.14_vite@5.2.7_@types+node@20.12.2_/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// package.json
var package_default = {
  name: "101tabs",
  displayName: "101tabs",
  description: "An extension to solve the 101 tabs problem.",
  private: true,
  version: "0.1.1",
  type: "module",
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    preview: "vite preview",
    preinstall: "npx only-allow pnpm",
    prepare: "husky install"
  },
  dependencies: {
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-hover-card": "^1.1.2",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-toast": "^1.2.2",
    "class-variance-authority": "^0.7.0",
    clsx: "^2.1.1",
    "lucide-react": "^0.447.0",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.5.3",
    "tailwindcss-animate": "^1.0.7"
  },
  devDependencies: {
    "@commitlint/cli": "^19.2.1",
    "@commitlint/config-conventional": "^19.1.0",
    "@crxjs/vite-plugin": "^1.0.14",
    "@ianvs/prettier-plugin-sort-imports": "^4.2.1",
    "@thedutchcoder/postcss-rem-to-px": "^0.0.2",
    "@types/chrome": "^0.0.268",
    "@types/node": "^20.12.2",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react-swc": "^3.6.0",
    autoprefixer: "^10.4.20",
    daisyui: "^4.9.0",
    eslint: "^8.57.0",
    "eslint-config-airbnb": "^19.0.4",
    "eslint-config-prettier": "^9.1.0",
    "eslint-import-resolver-typescript": "^3.6.1",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    husky: "^9.0.11",
    "lint-staged": "^15.2.2",
    postcss: "^8.4.47",
    "postcss-prefix-selector": "^1.16.0",
    prettier: "^3.2.5",
    "prettier-plugin-css-order": "^2.1.2",
    "prettier-plugin-tailwindcss": "^0.5.13",
    tailwindcss: "^3.4.13",
    typescript: "^5.2.2",
    vite: "^5.2.0",
    "vite-tsconfig-paths": "^4.3.2"
  },
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ],
    "**/*.{js,jsx,ts,tsx,json,css,scss,md}": [
      "prettier --write"
    ]
  },
  packageManager: "pnpm@8.15.0",
  engines: {
    node: "20.x",
    pnpm: ">=8.15.0"
  }
};

// src/manifest.ts
var isDev = process.env.NODE_ENV === "development";
var manifest_default = defineManifest({
  manifest_version: 3,
  name: `${package_default.displayName || package_default.name}${isDev ? ` \u27A1\uFE0F Dev` : ""}`,
  version: package_default.version,
  description: package_default.description,
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  options_page: "src/options/index.html",
  action: {
    default_popup: "src/popup/index.html",
    default_icon: {
      16: "icon16.png",
      32: "icon32.png",
      48: "icon48.png",
      128: "icon128.png"
    }
  },
  icons: {
    16: "icon16.png",
    32: "icon32.png",
    48: "icon48.png",
    128: "icon128.png"
  },
  permissions: ["alarms", "activeTab", "storage", "tabs", "notifications"],
  host_permissions: ["<all_urls>"],
  content_scripts: [
    {
      js: isDev ? ["src/content/index.dev.tsx"] : ["src/content/index.prod.tsx"],
      matches: ["<all_urls>"]
    }
  ],
  web_accessible_resources: [
    {
      resources: ["icon16.png", "icon32.png", "icon48.png", "icon128.png"],
      matches: []
    }
  ]
});

// vite.config.ts
var __vite_injected_original_dirname = "/mnt/c/Users/sabah/101tabs";
var viteManifestHackIssue846 = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: "manifestHackIssue846",
  renderCrxManifest(_manifest, bundle) {
    bundle["manifest.json"] = bundle[".vite/manifest.json"];
    bundle["manifest.json"].fileName = "manifest.json";
    delete bundle[".vite/manifest.json"];
  }
};
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    viteManifestHackIssue846,
    crx({
      manifest: manifest_default,
      contentScripts: {
        injectCss: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src"),
      "@utils": resolve(__vite_injected_original_dirname, "./src/utils"),
      "@assets": resolve(__vite_injected_original_dirname, "./src/assets")
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21hbmlmZXN0LnRzIiwgInBhY2thZ2UuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9zYWJhaC8xMDF0YWJzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbW50L2MvVXNlcnMvc2FiYWgvMTAxdGFicy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2MvVXNlcnMvc2FiYWgvMTAxdGFicy92aXRlLmNvbmZpZy50c1wiOy8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXBhcmFtLXJlYXNzaWduICovXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAndGFpbHdpbmRjc3MnIFxuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInXG5cbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL3NyYy9tYW5pZmVzdCc7XG5cbmNvbnN0IHZpdGVNYW5pZmVzdEhhY2tJc3N1ZTg0NjogUGx1Z2luICYge1xuICByZW5kZXJDcnhNYW5pZmVzdDogKG1hbmlmZXN0OiBhbnksIGJ1bmRsZTogYW55KSA9PiB2b2lkO1xufSA9IHtcbiAgLy8gV29ya2Fyb3VuZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jcnhqcy9jaHJvbWUtZXh0ZW5zaW9uLXRvb2xzL2lzc3Vlcy84NDYjaXNzdWVjb21tZW50LTE4NjE4ODA5MTkuXG4gIG5hbWU6ICdtYW5pZmVzdEhhY2tJc3N1ZTg0NicsXG4gIHJlbmRlckNyeE1hbmlmZXN0KF9tYW5pZmVzdCwgYnVuZGxlKSB7XG4gICAgYnVuZGxlWydtYW5pZmVzdC5qc29uJ10gPSBidW5kbGVbJy52aXRlL21hbmlmZXN0Lmpzb24nXTtcbiAgICBidW5kbGVbJ21hbmlmZXN0Lmpzb24nXS5maWxlTmFtZSA9ICdtYW5pZmVzdC5qc29uJztcbiAgICBkZWxldGUgYnVuZGxlWycudml0ZS9tYW5pZmVzdC5qc29uJ107XG4gIH0sXG59O1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdHNjb25maWdQYXRocygpLFxuICAgIHZpdGVNYW5pZmVzdEhhY2tJc3N1ZTg0NixcbiAgICBjcngoe1xuICAgICAgbWFuaWZlc3QsXG4gICAgICBjb250ZW50U2NyaXB0czoge1xuICAgICAgICBpbmplY3RDc3M6IHRydWUsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgJ0B1dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvdXRpbHMnKSxcbiAgICAgICdAYXNzZXRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9hc3NldHMnKSxcbiAgICB9LFxuICB9LFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXG4gICAgICAgIGF1dG9wcmVmaXhlcigpLFxuICAgICAgXSxcbiAgICB9LFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9zYWJhaC8xMDF0YWJzL3NyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL21udC9jL1VzZXJzL3NhYmFoLzEwMXRhYnMvc3JjL21hbmlmZXN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9tbnQvYy9Vc2Vycy9zYWJhaC8xMDF0YWJzL3NyYy9tYW5pZmVzdC50c1wiOy8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IGRlZmluZU1hbmlmZXN0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJztcblxuaW1wb3J0IHBhY2thZ2VEYXRhIGZyb20gJy4uL3BhY2thZ2UuanNvbic7XG5cbmNvbnN0IGlzRGV2ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZU1hbmlmZXN0KHtcbiAgbWFuaWZlc3RfdmVyc2lvbjogMyxcbiAgbmFtZTogYCR7cGFja2FnZURhdGEuZGlzcGxheU5hbWUgfHwgcGFja2FnZURhdGEubmFtZX0ke1xuICAgIGlzRGV2ID8gYCBcdTI3QTFcdUZFMEYgRGV2YCA6ICcnXG4gIH1gLFxuICB2ZXJzaW9uOiBwYWNrYWdlRGF0YS52ZXJzaW9uLFxuICBkZXNjcmlwdGlvbjogcGFja2FnZURhdGEuZGVzY3JpcHRpb24sXG4gIGJhY2tncm91bmQ6IHtcbiAgICBzZXJ2aWNlX3dvcmtlcjogJ3NyYy9iYWNrZ3JvdW5kL2luZGV4LnRzJyxcbiAgICB0eXBlOiAnbW9kdWxlJyxcbiAgfSxcbiAgb3B0aW9uc19wYWdlOiAnc3JjL29wdGlvbnMvaW5kZXguaHRtbCcsXG4gIGFjdGlvbjoge1xuICAgIGRlZmF1bHRfcG9wdXA6ICdzcmMvcG9wdXAvaW5kZXguaHRtbCcsXG4gICAgZGVmYXVsdF9pY29uOiB7XG4gICAgICAxNjogJ2ljb24xNi5wbmcnLFxuICAgICAgMzI6ICdpY29uMzIucG5nJyxcbiAgICAgIDQ4OiAnaWNvbjQ4LnBuZycsXG4gICAgICAxMjg6ICdpY29uMTI4LnBuZycsXG4gICAgfSxcbiAgfSxcbiAgaWNvbnM6IHtcbiAgICAxNjogJ2ljb24xNi5wbmcnLFxuICAgIDMyOiAnaWNvbjMyLnBuZycsXG4gICAgNDg6ICdpY29uNDgucG5nJyxcbiAgICAxMjg6ICdpY29uMTI4LnBuZycsXG4gIH0sXG4gIHBlcm1pc3Npb25zOiBbJ2FsYXJtcycsICdhY3RpdmVUYWInLCAnc3RvcmFnZScsICd0YWJzJywgJ25vdGlmaWNhdGlvbnMnXSxcbiAgaG9zdF9wZXJtaXNzaW9uczogWyc8YWxsX3VybHM+J10gLFxuICBjb250ZW50X3NjcmlwdHM6IFtcbiAgICB7XG4gICAgICBqczogaXNEZXZcbiAgICAgICAgPyBbJ3NyYy9jb250ZW50L2luZGV4LmRldi50c3gnXVxuICAgICAgICA6IFsnc3JjL2NvbnRlbnQvaW5kZXgucHJvZC50c3gnXSxcbiAgICAgIG1hdGNoZXM6IFsnPGFsbF91cmxzPiddLFxuICAgIH0sXG4gIF0sXG4gIHdlYl9hY2Nlc3NpYmxlX3Jlc291cmNlczogW1xuICAgIHtcbiAgICAgIHJlc291cmNlczogWydpY29uMTYucG5nJywgJ2ljb24zMi5wbmcnLCAnaWNvbjQ4LnBuZycsICdpY29uMTI4LnBuZyddLFxuICAgICAgbWF0Y2hlczogW10sXG4gICAgfSxcbiAgXSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiMTAxdGFic1wiLFxuICBcImRpc3BsYXlOYW1lXCI6IFwiMTAxdGFic1wiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiQW4gZXh0ZW5zaW9uIHRvIHNvbHZlIHRoZSAxMDEgdGFicyBwcm9ibGVtLlwiLFxuICBcInByaXZhdGVcIjogdHJ1ZSxcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4xLjFcIixcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInRzYyAmJiB2aXRlIGJ1aWxkXCIsXG4gICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1leHQgdHMsdHN4IC0tcmVwb3J0LXVudXNlZC1kaXNhYmxlLWRpcmVjdGl2ZXMgLS1tYXgtd2FybmluZ3MgMFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxuICAgIFwicHJlaW5zdGFsbFwiOiBcIm5weCBvbmx5LWFsbG93IHBucG1cIixcbiAgICBcInByZXBhcmVcIjogXCJodXNreSBpbnN0YWxsXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvblwiOiBcIl4xLjIuMVwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LWhvdmVyLWNhcmRcIjogXCJeMS4xLjJcIixcbiAgICBcIkByYWRpeC11aS9yZWFjdC1pY29uc1wiOiBcIl4xLjMuMFwiLFxuICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvYXN0XCI6IFwiXjEuMi4yXCIsXG4gICAgXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIjogXCJeMC43LjBcIixcbiAgICBcImNsc3hcIjogXCJeMi4xLjFcIixcbiAgICBcImx1Y2lkZS1yZWFjdFwiOiBcIl4wLjQ0Ny4wXCIsXG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4yLjBcIixcbiAgICBcInRhaWx3aW5kLW1lcmdlXCI6IFwiXjIuNS4zXCIsXG4gICAgXCJ0YWlsd2luZGNzcy1hbmltYXRlXCI6IFwiXjEuMC43XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGNvbW1pdGxpbnQvY2xpXCI6IFwiXjE5LjIuMVwiLFxuICAgIFwiQGNvbW1pdGxpbnQvY29uZmlnLWNvbnZlbnRpb25hbFwiOiBcIl4xOS4xLjBcIixcbiAgICBcIkBjcnhqcy92aXRlLXBsdWdpblwiOiBcIl4xLjAuMTRcIixcbiAgICBcIkBpYW52cy9wcmV0dGllci1wbHVnaW4tc29ydC1pbXBvcnRzXCI6IFwiXjQuMi4xXCIsXG4gICAgXCJAdGhlZHV0Y2hjb2Rlci9wb3N0Y3NzLXJlbS10by1weFwiOiBcIl4wLjAuMlwiLFxuICAgIFwiQHR5cGVzL2Nocm9tZVwiOiBcIl4wLjAuMjY4XCIsXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIl4yMC4xMi4yXCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi42NlwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjIyXCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl43LjIuMFwiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlclwiOiBcIl43LjIuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI6IFwiXjMuNi4wXCIsXG4gICAgXCJhdXRvcHJlZml4ZXJcIjogXCJeMTAuNC4yMFwiLFxuICAgIFwiZGFpc3l1aVwiOiBcIl40LjkuMFwiLFxuICAgIFwiZXNsaW50XCI6IFwiXjguNTcuMFwiLFxuICAgIFwiZXNsaW50LWNvbmZpZy1haXJibmJcIjogXCJeMTkuMC40XCIsXG4gICAgXCJlc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiXjkuMS4wXCIsXG4gICAgXCJlc2xpbnQtaW1wb3J0LXJlc29sdmVyLXR5cGVzY3JpcHRcIjogXCJeMy42LjFcIixcbiAgICBcImVzbGludC1wbHVnaW4taW1wb3J0XCI6IFwiXjIuMjkuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1qc3gtYTExeVwiOiBcIl42LjguMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1yZWFjdFwiOiBcIl43LjM0LjFcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtaG9va3NcIjogXCJeNC42LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3QtcmVmcmVzaFwiOiBcIl4wLjQuNlwiLFxuICAgIFwiaHVza3lcIjogXCJeOS4wLjExXCIsXG4gICAgXCJsaW50LXN0YWdlZFwiOiBcIl4xNS4yLjJcIixcbiAgICBcInBvc3Rjc3NcIjogXCJeOC40LjQ3XCIsXG4gICAgXCJwb3N0Y3NzLXByZWZpeC1zZWxlY3RvclwiOiBcIl4xLjE2LjBcIixcbiAgICBcInByZXR0aWVyXCI6IFwiXjMuMi41XCIsXG4gICAgXCJwcmV0dGllci1wbHVnaW4tY3NzLW9yZGVyXCI6IFwiXjIuMS4yXCIsXG4gICAgXCJwcmV0dGllci1wbHVnaW4tdGFpbHdpbmRjc3NcIjogXCJeMC41LjEzXCIsXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjQuMTNcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS4yLjJcIixcbiAgICBcInZpdGVcIjogXCJeNS4yLjBcIixcbiAgICBcInZpdGUtdHNjb25maWctcGF0aHNcIjogXCJeNC4zLjJcIlxuICB9LFxuICBcImxpbnQtc3RhZ2VkXCI6IHtcbiAgICBcIioqLyoue2pzLGpzeCx0cyx0c3h9XCI6IFtcbiAgICAgIFwiZXNsaW50IC0tZml4XCJcbiAgICBdLFxuICAgIFwiKiovKi57anMsanN4LHRzLHRzeCxqc29uLGNzcyxzY3NzLG1kfVwiOiBbXG4gICAgICBcInByZXR0aWVyIC0td3JpdGVcIlxuICAgIF1cbiAgfSxcbiAgXCJwYWNrYWdlTWFuYWdlclwiOiBcInBucG1AOC4xNS4wXCIsXG4gIFwiZW5naW5lc1wiOiB7XG4gICAgXCJub2RlXCI6IFwiMjAueFwiLFxuICAgIFwicG5wbVwiOiBcIj49OC4xNS4wXCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsZUFBZTtBQUN4QixTQUFTLFdBQVc7QUFDcEIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQTRCO0FBQ3JDLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8saUJB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
