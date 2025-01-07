import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
	plugins: [tsconfigPaths(), basicSsl()],
  server: {
    https: true
  }
});
