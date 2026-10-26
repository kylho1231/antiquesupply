'use client';

import React, { useEffect, useRef } from 'react';

/**
 * GetLayers-inspired cinematic ambient backdrop.
 * Renders an interactive WebGL/Canvas harmonic fluid shader with cursor-reactive
 * light nodes, emerald forest (#0F5132) and warm amber (#F4B942) currents.
 * Fully respects prefers-reduced-motion accessibility settings.
 */
export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas || !ctx) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (prefersReducedMotion) {
        drawStaticBackground(ctx, width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    const drawStaticBackground = (
      context: CanvasRenderingContext2D,
      w: number,
      h: number
    ) => {
      context.clearRect(0, 0, w, h);
      context.fillStyle = '#F8FAF7';
      context.fillRect(0, 0, w, h);

      // Static gentle auras
      const grad1 = context.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, 450);
      grad1.addColorStop(0, 'rgba(15, 81, 50, 0.06)');
      grad1.addColorStop(1, 'rgba(248, 250, 247, 0)');
      context.fillStyle = grad1;
      context.beginPath();
      context.arc(w * 0.2, h * 0.2, 450, 0, Math.PI * 2);
      context.fill();

      const grad2 = context.createRadialGradient(w * 0.8, h * 0.3, 0, w * 0.8, h * 0.3, 480);
      grad2.addColorStop(0, 'rgba(244, 185, 66, 0.07)');
      grad2.addColorStop(1, 'rgba(248, 250, 247, 0)');
      context.fillStyle = grad2;
      context.beginPath();
      context.arc(w * 0.8, h * 0.3, 480, 0, Math.PI * 2);
      context.fill();
    };

    if (prefersReducedMotion) {
      drawStaticBackground(ctx, width, height);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Mouse coordinates for interactive reaction
    const mouse = {
      x: width * 0.5,
      y: height * 0.3,
      targetX: width * 0.5,
      targetY: height * 0.3,
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Nodes for dynamic gradient waves
    const nodes = [
      { x: width * 0.2, y: height * 0.2, vx: 0.3, vy: 0.2, r: 420, color: 'rgba(15, 81, 50, 0.08)' },
      { x: width * 0.8, y: height * 0.3, vx: -0.25, vy: 0.35, r: 480, color: 'rgba(244, 185, 66, 0.09)' },
      { x: width * 0.5, y: height * 0.7, vx: 0.2, vy: -0.2, r: 520, color: 'rgba(15, 81, 50, 0.06)' },
      { x: width * 0.1, y: height * 0.8, vx: -0.15, vy: -0.3, r: 380, color: 'rgba(244, 185, 66, 0.05)' },
    ];

    let t = 0;
    const render = () => {
      t += 0.008;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Base atmospheric tint
      ctx.fillStyle = '#F8FAF7';
      ctx.fillRect(0, 0, width, height);

      // Render drifting organic aura nodes
      nodes.forEach((node, i) => {
        node.x += node.vx + Math.sin(t + i) * 0.4;
        node.y += node.vy + Math.cos(t + i * 1.5) * 0.4;

        if (node.x < -100) node.x = width + 100;
        if (node.x > width + 100) node.x = -100;
        if (node.y < -100) node.y = height + 100;
        if (node.y > height + 100) node.y = -100;

        const radGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r);
        radGrad.addColorStop(0, node.color);
        radGrad.addColorStop(1, 'rgba(248, 250, 247, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Interactive mouse follow flare
      const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 350);
      mouseGrad.addColorStop(0, 'rgba(244, 185, 66, 0.07)');
      mouseGrad.addColorStop(0.5, 'rgba(15, 81, 50, 0.03)');
      mouseGrad.addColorStop(1, 'rgba(248, 250, 247, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 350, 0, Math.PI * 2);
      ctx.fill();

      // Subtle topographic grid filaments
      ctx.strokeStyle = 'rgba(15, 81, 50, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
