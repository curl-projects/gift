import * as BABYLON from "@babylonjs/core";
// to do -- replace with asset class
export function addSmokeShader(scene) {
    return new Promise((resolve, reject) => {
        // Define vertex shader
        const vertexShader = `
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;

        #include<bonesDeclaration>

        uniform mat4 world;
        uniform mat4 viewProjection;
        uniform vec3 uColor;
        uniform float time;
        varying vec3 vColor;
        varying vec2 vUV;
        varying vec3 vPosition;

        vec3 permute(vec3 x) {
            return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        vec4 permute(vec4 x) {
            return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;

            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

            vec3 ns = 0.142857142857 * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);

            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);

            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);

            vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(
                dot(p0, p0), dot(p1, p1),
                dot(p2, p2), dot(p3, p3));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            vec4 m = max(0.6 - vec4(
                dot(x0, x0), dot(x1, x1),
                dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(
                dot(p0, x0), dot(p1, x1),
                dot(p2, x2), dot(p3, x3)));
        }

        void main() {
            mat4 finalWorld = world;
            #include<bonesVertex>
            vec3 displacedPosition = position + normal * snoise(position + time * 0.03) * 0.01; // Slower and lower amplitude TIME AND AMPLITUDE
            gl_Position = viewProjection * finalWorld * vec4(displacedPosition, 1.0);
            mat3 normalMat = mat3(finalWorld);
            vec3 vNormal = normalMat * normal;
            vColor = uColor * (0.5 + 0.5 * dot(vNormal, vec3(0.0, 1.0, 0.0)));
            vUV = uv;
            vPosition = (finalWorld * vec4(displacedPosition, 1.0)).xyz;
        }
        `;

        // Define fragment shader
        const fragmentShader = `
        varying vec3 vColor;
        varying vec2 vUV;
        varying vec3 vPosition;
        uniform sampler2D smokeTexture;
        uniform float time;
        uniform vec3 emissiveColor;

        vec3 permute(vec3 x) {
            return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        vec4 permute(vec4 x) {
            return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;

            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

            vec3 ns = 0.142857142857 * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);

            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);

            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);

            vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(
                dot(p0, p0), dot(p1, p1),
                dot(p2, p2), dot(p3, p3));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            vec4 m = max(0.6 - vec4(
                dot(x0, x0), dot(x1, x1),
                dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(
                dot(p0, x0), dot(p1, x1),
                dot(p2, x2), dot(p3, x3)));
        }

        void main(void) {
            vec3 pos = vPosition * 0.1 + vec3(time * 0.1);
            float n = snoise(pos);
            vec4 smoke = texture2D(smokeTexture, vUV + n);

            // Temporarily comment out discard logic for debugging
            // if (smoke.r < 0.2 || smoke.r > 0.8) {
            //     discard;
            // }

            // Fading edges effect
            float fade = 1.0 - smoothstep(0.4, 0.5, length(vUV - 0.5));

            // Set half opacity for the visible fragments and add emissive color
            vec3 finalColor = mix(vColor * smoke.rgb, emissiveColor, 0.8);
            gl_FragColor = vec4(finalColor, 0.8 * smoke.a * n * fade);
        }
        `;

        // Load the smoke texture and create the shader material
        const smokeTexture = new BABYLON.Texture("/assets/smoke.png", scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE, () => {
            console.log("Smoke texture loaded successfully");

            // Create the shader material
            const smokeShader = new BABYLON.ShaderMaterial("smokeShader", scene, {
                vertexSource: vertexShader,
                fragmentSource: fragmentShader,
            }, {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "viewProjection", "uColor", "smokeTexture", "time", "emissiveColor"]
            });

            smokeShader.setTexture("smokeTexture", smokeTexture);
            smokeShader.setFloat("time", 0);
            smokeShader.setColor3("uColor", new BABYLON.Color3(0.5, 0.5, 0.5)); // Set default color to grey
            smokeShader.setColor3("emissiveColor", new BABYLON.Color3(1.0, 0.5, 0.0)); // Set emissive color (orange)
            smokeShader.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
            smokeShader.backFaceCulling = false;
            smokeShader.needAlphaBlending = () => true; // Enable alpha blending

            // Register the before render function
            scene.registerBeforeRender(function () {
                const currentTime = performance.now() * 0.001;
                smokeShader.setFloat("time", currentTime);
            });

            // Resolve the promise with the shader material
            resolve(smokeShader);
        }, null, (error) => {
            console.error("Failed to load smoke texture:", error);
            reject(error);
        });
    });
}
        