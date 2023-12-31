import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import glsl from "vite-plugin-glsl"
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        react(),
        glsl(),
        VitePWA({
            registerType: "prompt", 
            includeAssets: ["fonts/*.woff", "models/*.glb", "textures/*.png"],
            manifest: {
                name: "Zax",
                short_name: "Zax",
                display: "fullscreen",
                description: "Zax",
                orientation: "landscape",
                theme_color: "#000000",
                icons: [
                    {
                        "src": "/icons/pwa-icon.png",
                        "sizes": "512x512",
                        "type": "image/png",
                        "purpose": "any maskable"
                    },
                ]
            }
        })
    ],
})