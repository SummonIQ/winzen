"use client";

import { useEffect, useRef, useState } from "react";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const locRef = useRef<{
    time: WebGLUniformLocation | null;
    res: WebGLUniformLocation | null;
    mouse: WebGLUniformLocation | null;
  } | null>(null);

  const reducedMotionRef = useRef(false);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      }) as WebGLRenderingContext | null) ?? null;

    if (!gl) {
      setWebglOk(false);
      return;
    }
    glRef.current = gl;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReduced = () => {
      reducedMotionRef.current = mq.matches;
    };
    updateReduced();
    mq.addEventListener("change", updateReduced);

    const vs = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Aurora-ish fragment shader: layered flow fields + noise + vignette.
    const fs = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      float hash(vec2 p){
        p = fract(p*vec2(123.34, 456.21));
        p += dot(p, p+34.345);
        return fract(p.x*p.y);
      }

      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }

      float fbm(vec2 p){
        float v = 0.0;
        float a = 0.5;
        for(int i=0;i<5;i++){
          v += a * noise(p);
          p = p*2.02 + vec2(12.3, 45.6);
          a *= 0.5;
        }
        return v;
      }

      vec3 palette(float t){
        vec3 a = vec3(0.08, 0.08, 0.14);
        vec3 b = vec3(0.20, 0.20, 0.35);
        vec3 c = vec3(0.90, 0.65, 1.00);
        vec3 d = vec3(0.45, 0.75, 1.00);
        return a + b*cos(6.28318*(c*t + d));
      }

      void main(){
        vec2 uv = v_uv;
        float aspect = u_resolution.x / max(1.0, u_resolution.y);
        vec2 p = uv - 0.5;
        p.x *= aspect;

        vec2 m = u_mouse - 0.5;
        m.x *= aspect;

        float t = u_time * 0.18;

        // Flow field warp
        vec2 q = p;
        q += 0.12 * vec2(
          fbm(p*2.0 + t + m*0.9),
          fbm(p*2.0 - t - m*0.9)
        );

        float n = fbm(q*2.6 + vec2(t, -t));
        float bands = smoothstep(0.25, 0.85, n);
        float glow = pow(bands, 2.2);

        // Secondary streaks
        float n2 = fbm(q*4.2 + vec2(-t*1.2, t*0.9));
        float streaks = smoothstep(0.55, 0.95, n2);
        streaks = pow(streaks, 2.6);

        float vig = smoothstep(0.95, 0.25, length(p));

        vec3 col = vec3(0.0);
        col += palette(n*0.9 + 0.15) * glow;
        col += palette(n2*0.7 + 0.35) * streaks * 0.55;

        // Deep background
        vec3 base = vec3(0.03, 0.04, 0.07);
        col = base + col * 0.85;
        col *= 0.65 + 0.55*vig;

        // Dither/noise
        float d = hash(gl_FragCoord.xy) * 0.03;
        col += d;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const program = createProgram(gl, vs, fs);
    if (!program) {
      setWebglOk(false);
      return;
    }
    programRef.current = program;

    const aPos = gl.getAttribLocation(program, "a_pos");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    locRef.current = { time: uTime, res: uRes, mouse: uMouse };

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Full-screen triangle strip using 2 triangles (works everywhere)
    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.useProgram(program);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const onResize = () => resize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(1, rect.width);
      const y = (e.clientY - rect.top) / Math.max(1, rect.height);
      mouseRef.current = { x: clamp01(x), y: clamp01(1 - y) };
    };

    let start = performance.now();

    const render = (now: number) => {
      const loc = locRef.current;
      if (!loc) return;
      gl.useProgram(program);
      gl.uniform1f(loc.time, (now - start) / 1000);
      gl.uniform2f(loc.mouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotionRef.current) {
        rafRef.current = window.requestAnimationFrame(render);
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else {
        start = performance.now();
        if (rafRef.current === null) {
          rafRef.current = window.requestAnimationFrame(render);
        }
      }
    };

    resize();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    if (!reducedMotionRef.current) {
      rafRef.current = window.requestAnimationFrame(render);
    } else {
      render(performance.now());
    }

    return () => {
      mq.removeEventListener("change", updateReduced);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      try {
        if (buffer) gl.deleteBuffer(buffer);
        if (programRef.current) gl.deleteProgram(programRef.current);
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-95"
      />
      {!webglOk && (
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-indigo-500/18 blur-3xl animate-blob" />
          <div className="absolute -bottom-32 left-1/3 w-[32rem] h-[32rem] rounded-full bg-blue-500/14 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -top-20 -right-24 w-[26rem] h-[26rem] rounded-full bg-sky-500/14 blur-3xl animate-blob animation-delay-4000" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/25 dark:to-black/55" />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_78%)] bg-white/6 dark:bg-white/8" />
    </div>
  );
}
