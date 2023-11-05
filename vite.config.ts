import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import glsl from "vite-plugin-glsl"
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        glsl(),
        VitePWA({
            registerType: "autoUpdate", 
            includeAssets: ["fonts/*.woff", "models/*.glb", "textures/*.png"]
        })
    ],
})