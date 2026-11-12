"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type RefObject,
} from "react";
import gsap from "gsap";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  type Texture,
} from "three";
import { loadWorkTexture } from "@/lib/placeholderTexture";
import type { Work } from "@/content/site";

const MAX_PIXEL_RATIO = 1.5;
const TRANSITION_SECONDS = 1.1;

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uAspA;
  uniform float uAspB;
  uniform float uGrain;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + 17.0;
      amplitude *= 0.5;
    }
    return value / 0.9375;
  }

  // background-size: cover, for a texture of aspect texAsp.
  vec2 coverUv(vec2 uv, float texAsp, float canvasAsp) {
    vec2 scale = vec2(1.0);
    if (canvasAsp > texAsp) {
      scale.y = texAsp / canvasAsp;
    } else {
      scale.x = canvasAsp / texAsp;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float canvasAsp = uRes.x / max(uRes.y, 1.0);
    float n = fbm(uv * 3.0 + uTime * 0.05);

    // Noise warp: A distorts as it leaves, B settles as it arrives.
    vec2 uvA = coverUv(uv, uAspA, canvasAsp) + (n - 0.5) * 0.25 * uProgress;
    vec2 uvB = coverUv(uv, uAspB, canvasAsp) - (n - 0.5) * 0.25 * (1.0 - uProgress);

    // Reveal mask (1 = A, 0 = B). The threshold is stretched past both ends
    // so progress 0 is purely A and 1 purely B; B fills in from the bottom.
    float threshold = mix(-0.15, 1.15, uProgress);
    float m = smoothstep(threshold - 0.15, threshold + 0.15, n * 0.6 + uv.y * 0.4);

    vec3 color = mix(texture2D(tB, uvB).rgb, texture2D(tA, uvA).rgb, m);

    // Thin signal-red glow along the mask boundary, strongest mid-transition.
    // (Signal red given in linear space; output is converted back to sRGB.)
    float edge = 1.0 - abs(m - 0.5) * 2.0;
    vec3 signal = pow(vec3(0.886, 0.137, 0.102), vec3(2.2));
    color += signal * pow(edge, 8.0) * 0.9 * (uProgress * (1.0 - uProgress) * 4.0);

    color += (hash(uv * uRes + fract(uTime) * 100.0) - 0.5) * uGrain;
    color *= mix(0.86, 1.0, smoothstep(0.85, 0.35, length(uv - 0.5)));

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

let supportCache: boolean | undefined;

function isSupported() {
  if (typeof window === "undefined") return false;
  if (supportCache !== undefined) return supportCache;
  let ok = false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    ok = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    ok = false;
  }
  supportCache = ok;
  return ok;
}

const aspectOf = (texture: Texture) => {
  const image = texture.image as { width?: number; height?: number } | null;
  return image?.width && image.height ? image.width / image.height : 1.6;
};

export type WorkCanvasHandle = {
  /** Transition to the work at `index`. Safe to call mid-transition. */
  goTo: (index: number) => void;
};

type WorkCanvasProps = {
  items: Work[];
  /** Receives the imperative API ({ goTo }). */
  controls: RefObject<WorkCanvasHandle | null>;
  /** Index to show first (read once, when the canvas sets up). */
  initialIndex?: number;
  className?: string;
};

export default function WorkCanvas({
  items,
  controls,
  initialIndex = 0,
  className,
}: WorkCanvasProps) {
  // Client-only component (loaded with ssr: false), so this is safe in render.
  const [supported] = useState(isSupported);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const goToRef = useRef<(index: number) => void>(() => {});
  const startIndex = useRef(initialIndex);

  useEffect(() => {
    startIndex.current = initialIndex;
  }, [initialIndex]);

  useImperativeHandle(
    controls,
    () => ({ goTo: (index) => goToRef.current(index) }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!supported || !canvas || !parent) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return; // The parent's <img> fallback stays visible underneath.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const uniforms = {
      tA: { value: null as Texture | null },
      tB: { value: null as Texture | null },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uAspA: { value: 1.6 },
      uAspB: { value: 1.6 },
      uGrain: { value: 0.04 },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    /* Textures + transition state */
    const textures: (Texture | undefined)[] = [];
    const clampIndex = gsap.utils.clamp(0, items.length - 1);
    let disposed = false;
    let current = clampIndex(startIndex.current); // settled image
    let target = current; // image being (or last) transitioned to
    let tween: gsap.core.Tween | undefined;

    const showSettled = (index: number) => {
      const texture = textures[index];
      current = target = index;
      uniforms.uProgress.value = 0;
      if (!texture) return; // Applied when it finishes loading.
      uniforms.tA.value = texture;
      uniforms.uAspA.value = aspectOf(texture);
      canvas.style.opacity = "1";
    };

    goToRef.current = (rawIndex) => {
      const index = clampIndex(rawIndex);
      if (index === target) return;

      // Mid-transition: snap to the image we were heading for, start there.
      tween?.kill();
      tween = undefined;
      if (target !== current) showSettled(target);

      const from = textures[current];
      const to = textures[index];
      if (!from || !to) {
        showSettled(index);
        return;
      }

      target = index;
      uniforms.tB.value = to;
      uniforms.uAspB.value = aspectOf(to);
      tween = gsap.fromTo(
        uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: TRANSITION_SECONDS,
          ease: "power3.inOut",
          onComplete: () => {
            tween = undefined;
            showSettled(index);
          },
        },
      );
    };

    items.forEach((item, i) => {
      loadWorkTexture(item.image, item.no, item.title).then((texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        textures[i] = texture;
        if (i === current && !tween) showSettled(i);
      });
    });

    /* Sizing */
    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.getDrawingBufferSize(uniforms.uRes.value);
    };

    /* Loop — only while on screen and the tab is visible */
    let raf = 0;
    let intersecting = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      uniforms.uTime.value = now / 1000;
      if (uniforms.tA.value) renderer.render(scene, camera);
    };

    const updateRunning = () => {
      const shouldRun = intersecting && document.visibilityState !== "hidden";
      if (shouldRun && !raf) {
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updateRunning();
    });
    const resizeObserver = new ResizeObserver(resize);

    resize();
    intersectionObserver.observe(parent);
    resizeObserver.observe(parent);
    document.addEventListener("visibilitychange", updateRunning);

    return () => {
      disposed = true;
      goToRef.current = () => {};
      cancelAnimationFrame(raf);
      raf = 0;
      tween?.kill();
      document.removeEventListener("visibilitychange", updateRunning);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      textures.forEach((texture) => texture?.dispose());
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, [supported, items]);

  if (!supported) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // Transparent until the first texture is ready, so the parent's <img>
      // shows through in the meantime.
      className={`absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 ${className ?? ""}`}
    />
  );
}
