"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type IUniform,
} from "three";

/* ---------- Config ---------- */

const SIM_RES = 128;
const DYE_RES = 512;
const SIM_RES_COARSE = 96;
const DYE_RES_COARSE = 256;

const PRESSURE_ITERATIONS = 20;
const PRESSURE_CLEAR = 0.8;
const VELOCITY_DISSIPATION = 0.98; // per frame @ 60fps
const DYE_DISSIPATION = 0.955; // per frame @ 60fps — trails fade within ~1.5s of stillness
const POINTER_RADIUS = 0.0016;
const INTRO_RADIUS = 0.0018;
const SPLAT_FORCE = 6000;
const POINTER_FORCE_SCALE = 0.8;
// Dye never becomes fully opaque, so it cannot completely cover text.
const MAX_ALPHA = 0.75;
const MAX_DT = 1 / 30;
const MAX_PIXEL_RATIO = 1.5;

// Signal red, #E2231A.
const DYE_COLOR = [0.886, 0.137, 0.102] as const;
// Splats overlap heavily along a stroke, so each one deposits a fraction of
// the colour; the display shader normalises hue and uses the sum as alpha.
const DYE_STRENGTH = 0.25;
const DYE_VARIATION = 0.08;

const INTRO_DURATION = 2.0; // seconds
// After the intro, pointer splats this close to the viewport top (top bar) are ignored.
const POINTER_DEAD_ZONE_TOP = 100; // px
const DEFAULT_OPACITY = 0.55;

/* ---------- Shaders ---------- */

const vertexShader = /* glsl */ `
  uniform vec2 texelSize;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;

  void main() {
    vUv = uv;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const varyings = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
`;

const splatShader = /* glsl */ `
  ${varyings}
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;

  void main() {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const advectionShader = /* glsl */ `
  ${varyings}
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;

  void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = vec4(dissipation * texture2D(uSource, coord).rgb, 1.0);
  }
`;

const divergenceShader = /* glsl */ `
  ${varyings}
  uniform sampler2D uVelocity;

  void main() {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;

    // Solid walls: reflect velocity at the edges.
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }

    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
  }
`;

const clearShader = /* glsl */ `
  ${varyings}
  uniform sampler2D uTexture;
  uniform float value;

  void main() {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const pressureShader = /* glsl */ `
  ${varyings}
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;

  void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const gradientSubtractShader = /* glsl */ `
  ${varyings}
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;

  void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const displayShader = /* glsl */ `
  ${varyings}
  uniform sampler2D uDye;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uMaxAlpha;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 d = texture2D(uDye, vUv).rgb;
    // Normalise by the unclamped peak so heavy dye stays red instead of
    // blowing out to white; alpha carries the (clamped) intensity.
    float peak = max(d.r, max(d.g, d.b));
    float intensity = clamp(peak, 0.0, 1.0);
    vec3 color = d / max(peak, 1e-4);
    color += (hash(vUv * uResolution + uTime) - 0.5) * 0.03;
    // Fade the dye out near the top and bottom edges of the stage.
    float edgeFade = smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.82, 1.0, vUv.y));
    gl_FragColor = vec4(color, min(intensity * uOpacity, uMaxAlpha) * edgeFade);
  }
`;

/* ---------- Helpers ---------- */

type Uniforms = Record<string, IUniform>;

function makeMaterial(fragmentShader: string, uniforms: Uniforms) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { texelSize: { value: new Vector2() }, ...uniforms },
    depthTest: false,
    depthWrite: false,
  });
}

function makeTarget(width: number, height: number) {
  return new WebGLRenderTarget(width, height, {
    type: HalfFloatType,
    format: RGBAFormat,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

type DoubleTarget = {
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;
  swap: () => void;
  dispose: () => void;
};

function makeDoubleTarget(width: number, height: number): DoubleTarget {
  const target: DoubleTarget = {
    read: makeTarget(width, height),
    write: makeTarget(width, height),
    swap() {
      [target.read, target.write] = [target.write, target.read];
    },
    dispose() {
      target.read.dispose();
      target.write.dispose();
    },
  };
  return target;
}

/** `base` px on the shorter side, aspect preserved. */
function getResolution(base: number, width: number, height: number) {
  const aspect = width > height ? width / height : height / width;
  const long = Math.round(base * aspect);
  return width > height
    ? { width: long, height: base }
    : { width: base, height: long };
}

let supportCache: boolean | undefined;

/** WebGL2 with renderable half-float targets, and motion allowed. */
function isSupported() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (supportCache !== undefined) return supportCache;

  let ok = false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (gl && gl.getExtension("EXT_color_buffer_float")) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.deleteFramebuffer(framebuffer);
      gl.deleteTexture(texture);
    }
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    ok = false;
  }
  supportCache = ok;
  return ok;
}

/* ---------- Component ---------- */

type FluidDyeProps = {
  /** Delay before the intro stroke starts, in ms. */
  startDelay?: number;
  /** Live display opacity; read every frame, so mutate `.current` freely. */
  opacity?: RefObject<number>;
  className?: string;
};

export default function FluidDye({
  startDelay = 600,
  opacity,
  className,
}: FluidDyeProps) {
  // Client-only component (loaded with ssr: false), so this is safe in render.
  const [supported] = useState(isSupported);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    if (!supported || !wrap || !canvas || !dot) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      return; // No context available — render nothing, throw nothing.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;

    /* Fullscreen pass */
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);

    const splatMat = makeMaterial(splatShader, {
      uTarget: { value: null },
      aspectRatio: { value: 1 },
      color: { value: new Vector3() },
      point: { value: new Vector2() },
      radius: { value: POINTER_RADIUS },
    });
    const advectionMat = makeMaterial(advectionShader, {
      uVelocity: { value: null },
      uSource: { value: null },
      dt: { value: 0 },
      dissipation: { value: 1 },
    });
    const divergenceMat = makeMaterial(divergenceShader, {
      uVelocity: { value: null },
    });
    const clearMat = makeMaterial(clearShader, {
      uTexture: { value: null },
      value: { value: PRESSURE_CLEAR },
    });
    const pressureMat = makeMaterial(pressureShader, {
      uPressure: { value: null },
      uDivergence: { value: null },
    });
    const gradientMat = makeMaterial(gradientSubtractShader, {
      uPressure: { value: null },
      uVelocity: { value: null },
    });
    const displayMat = makeMaterial(displayShader, {
      uDye: { value: null },
      uResolution: { value: new Vector2() },
      uTime: { value: 0 },
      uOpacity: { value: DEFAULT_OPACITY },
      uMaxAlpha: { value: MAX_ALPHA },
    });
    const simMaterials = [
      splatMat,
      advectionMat,
      divergenceMat,
      clearMat,
      pressureMat,
      gradientMat,
    ];
    const materials = [...simMaterials, displayMat];

    const mesh = new Mesh(geometry, displayMat);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const blit = (target: WebGLRenderTarget | null, material: ShaderMaterial) => {
      mesh.material = material;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    };

    /* Render targets */
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const simBase = coarse ? SIM_RES_COARSE : SIM_RES;
    const dyeBase = coarse ? DYE_RES_COARSE : DYE_RES;

    let velocity: DoubleTarget | undefined;
    let pressure: DoubleTarget | undefined;
    let dye: DoubleTarget | undefined;
    let divergence: WebGLRenderTarget | undefined;
    let aspect = 1;

    const disposeTargets = () => {
      velocity?.dispose();
      pressure?.dispose();
      dye?.dispose();
      divergence?.dispose();
      velocity = pressure = dye = divergence = undefined;
    };

    const resize = () => {
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      if (!width || !height) return;

      renderer.setSize(width, height, false);
      aspect = width / height;

      const sim = getResolution(simBase, width, height);
      const dyeSize = getResolution(dyeBase, width, height);

      disposeTargets();
      velocity = makeDoubleTarget(sim.width, sim.height);
      pressure = makeDoubleTarget(sim.width, sim.height);
      divergence = makeTarget(sim.width, sim.height);
      dye = makeDoubleTarget(dyeSize.width, dyeSize.height);

      // Advection displaces in sim texels for both velocity and dye.
      for (const material of simMaterials) {
        material.uniforms.texelSize.value.set(1 / sim.width, 1 / sim.height);
      }
      renderer.getDrawingBufferSize(displayMat.uniforms.uResolution.value);
    };

    /* Splatting */
    const splat = (
      x: number,
      y: number,
      dx: number,
      dy: number,
      radius: number,
      forceScale = 1,
    ) => {
      if (!velocity || !dye) return;

      // Aspect-correct the pointer delta, then scale to a force.
      const fx = (aspect < 1 ? dx * aspect : dx) * SPLAT_FORCE * forceScale;
      const fy = (aspect > 1 ? dy / aspect : dy) * SPLAT_FORCE * forceScale;

      splatMat.uniforms.aspectRatio.value = aspect;
      splatMat.uniforms.point.value.set(x, y);
      splatMat.uniforms.radius.value =
        aspect > 1 ? radius * aspect : radius;

      splatMat.uniforms.uTarget.value = velocity.read.texture;
      splatMat.uniforms.color.value.set(fx, fy, 0);
      blit(velocity.write, splatMat);
      velocity.swap();

      // Signal red with a small brightness wobble so trails feel organic.
      const k = DYE_STRENGTH * (1 + (Math.random() * 2 - 1) * DYE_VARIATION);
      splatMat.uniforms.uTarget.value = dye.read.texture;
      splatMat.uniforms.color.value.set(
        DYE_COLOR[0] * k,
        DYE_COLOR[1] * k,
        DYE_COLOR[2] * k,
      );
      blit(dye.write, splatMat);
      dye.swap();
    };

    /* Pointer input (pointer events cover mouse, pen and touch) */
    const pointer = { x: 0, y: 0, px: 0, py: 0, inside: false, moved: false };
    const intro = { started: false, done: false, px: 0, py: 0 };

    const onPointerMove = (event: PointerEvent) => {
      if (intro.done && event.clientY < POINTER_DEAD_ZONE_TOP) {
        pointer.inside = false; // re-entry starts with no delta
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;

      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointer.inside = false;
        return;
      }
      if (!pointer.inside) {
        // (Re)entering: no delta, so no velocity spike across the gap.
        pointer.inside = true;
        pointer.px = x;
        pointer.py = y;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    };

    /* Intro virtual pointer */
    const introDelay = startDelay / 1000;
    let clock = 0; // seconds of simulated (visible) time

    const stepIntro = () => {
      if (intro.done || clock < introDelay) return;

      const t = clock - introDelay;
      if (t >= INTRO_DURATION) {
        intro.done = true;
        dot.style.opacity = "0"; // 0.4s CSS transition
        return;
      }

      // A single left-to-right brush stroke; never enters the top 25%.
      const x = 0.15 + 0.7 * (t / INTRO_DURATION);
      const y = 0.62 + 0.08 * Math.sin(t * 4.0);
      if (!intro.started) {
        intro.started = true;
        intro.px = x;
        intro.py = y;
        dot.style.opacity = "1";
      }
      dot.style.left = `${x * 100}%`;
      dot.style.top = `${(1 - y) * 100}%`;
      splat(x, y, x - intro.px, y - intro.py, INTRO_RADIUS);
      intro.px = x;
      intro.py = y;
    };

    /* Simulation step */
    const step = (dt: number) => {
      if (!velocity || !pressure || !dye || !divergence) return;

      divergenceMat.uniforms.uVelocity.value = velocity.read.texture;
      blit(divergence, divergenceMat);

      clearMat.uniforms.uTexture.value = pressure.read.texture;
      blit(pressure.write, clearMat);
      pressure.swap();

      pressureMat.uniforms.uDivergence.value = divergence.texture;
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        pressureMat.uniforms.uPressure.value = pressure.read.texture;
        blit(pressure.write, pressureMat);
        pressure.swap();
      }

      gradientMat.uniforms.uPressure.value = pressure.read.texture;
      gradientMat.uniforms.uVelocity.value = velocity.read.texture;
      blit(velocity.write, gradientMat);
      velocity.swap();

      // Dissipation is specified per frame at 60fps; normalise by dt.
      const frames = dt * 60;
      advectionMat.uniforms.dt.value = dt;

      advectionMat.uniforms.uVelocity.value = velocity.read.texture;
      advectionMat.uniforms.uSource.value = velocity.read.texture;
      advectionMat.uniforms.dissipation.value = VELOCITY_DISSIPATION ** frames;
      blit(velocity.write, advectionMat);
      velocity.swap();

      advectionMat.uniforms.uVelocity.value = velocity.read.texture;
      advectionMat.uniforms.uSource.value = dye.read.texture;
      advectionMat.uniforms.dissipation.value = DYE_DISSIPATION ** frames;
      blit(dye.write, advectionMat);
      dye.swap();
    };

    /* Loop — only runs while on screen and the tab is visible */
    let raf = 0;
    let last = 0;
    let intersecting = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;
      clock += dt;

      stepIntro();
      if (pointer.moved) {
        pointer.moved = false;
        splat(
          pointer.x,
          pointer.y,
          pointer.x - pointer.px,
          pointer.y - pointer.py,
          POINTER_RADIUS,
          POINTER_FORCE_SCALE,
        );
        pointer.px = pointer.x;
        pointer.py = pointer.y;
      }

      step(dt);

      if (dye) {
        displayMat.uniforms.uDye.value = dye.read.texture;
        displayMat.uniforms.uTime.value = (now / 1000) % 10;
        displayMat.uniforms.uOpacity.value = opacity?.current ?? DEFAULT_OPACITY;
        blit(null, displayMat);
      }
    };

    const updateRunning = () => {
      const shouldRun = intersecting && document.visibilityState !== "hidden";
      if (shouldRun && !raf) {
        last = performance.now();
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
    intersectionObserver.observe(wrap);
    resizeObserver.observe(wrap);
    document.addEventListener("visibilitychange", updateRunning);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", updateRunning);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      disposeTargets();
      materials.forEach((material) => material.dispose());
      geometry.dispose();
      renderer.dispose();
    };
  }, [supported, startDelay, opacity]);

  if (!supported) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      {/* Intro virtual pointer */}
      <div
        ref={dotRef}
        className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal opacity-0 transition-opacity duration-[400ms]"
      />
    </div>
  );
}
