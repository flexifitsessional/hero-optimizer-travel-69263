
import { useEffect, useRef } from 'react';
import p5 from 'p5';

const ChromaticSmoke = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const particles: any[] = [];
      const maxParticles = 100; // Maximum number of particles allowed
      const baseParticles = 30; // Base number of ambient particles
      const mouseRepelRadius = 100;
      const mouseRepelStrength = 2;
      
      const flags = [
        "🇺🇸", "🇬🇧", "🇫🇷", "🇩🇪", "🇮🇹", "🇪🇸", "🇵🇹", "🇯🇵",
        "🇰🇷", "🇨🇳", "🇮🇳", "🇧🇷", "🇲🇽", "🇨🇦", "🇦🇺", "🇳🇿",
        "🇿🇦", "🇸🇪", "🇳🇴", "🇫🇮", "🇩🇰", "🇳🇱", "🇧🇪", "🇨🇭"
      ];
      
      class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        acc: p5.Vector;
        flag: string;
        size: number;
        opacity: number;
        rotation: number;
        life: number;
        maxLife: number;
        isExplosion: boolean;
        
        constructor(x?: number, y?: number, isExplosion = false) {
          this.pos = p.createVector(
            x ?? p.random(p.width),
            y ?? p.random(p.height)
          );
          this.vel = p.createVector(
            isExplosion ? p.random(-5, 5) : p.random(-0.5, 0.5),
            isExplosion ? p.random(-5, 5) : p.random(-0.5, 0.5)
          );
          this.acc = p.createVector(0, 0);
          this.flag = flags[Math.floor(p.random(flags.length))];
          this.size = p.random(30, 40); // Increased size
          this.opacity = p.random(0.3, 0.8);
          this.rotation = p.random(p.TWO_PI);
          this.life = 255;
          this.maxLife = isExplosion ? 100 : 255;
          this.isExplosion = isExplosion;
        }
        
        applyMouseForce(mousePos: p5.Vector) {
          const dir = p5.Vector.sub(this.pos, mousePos);
          const distance = dir.mag();
          
          if (distance < mouseRepelRadius) {
            dir.normalize();
            const force = p.map(distance, 0, mouseRepelRadius, mouseRepelStrength, 0);
            dir.mult(force);
            this.acc.add(dir);
          }
        }
        
        update() {
          // Reduce life for explosion particles
          if (this.isExplosion) {
            this.life -= 5;
            // Add gravity effect for explosion particles
            this.acc.add(0, 0.1);
          }

          const mousePos = p.createVector(p.mouseX, p.mouseY);
          this.applyMouseForce(mousePos);
          
          const noiseScale = 0.002;
          const noiseVal = p.noise(
            this.pos.x * noiseScale, 
            this.pos.y * noiseScale, 
            p.frameCount * 0.005
          );
          
          const angle = noiseVal * p.TWO_PI * 2;
          const force = p5.Vector.fromAngle(angle);
          force.mult(0.1);
          this.acc.add(force);
          
          this.vel.add(this.acc);
          this.vel.limit(this.isExplosion ? 5 : 0.8);
          this.pos.add(this.vel);
          this.acc.mult(0);
          
          this.rotation += 0.01;
          
          // Wrap around edges for ambient particles, but not for explosion particles
          if (!this.isExplosion) {
            if (this.pos.x < -this.size) this.pos.x = p.width + this.size;
            if (this.pos.x > p.width + this.size) this.pos.x = -this.size;
            if (this.pos.y < -this.size) this.pos.y = p.height + this.size;
            if (this.pos.y > p.height + this.size) this.pos.y = -this.size;
          }
        }
        
        isDead() {
          return this.life <= 0 || 
                 (this.isExplosion && 
                  (this.pos.y > p.height + this.size || 
                   this.pos.x < -this.size || 
                   this.pos.x > p.width + this.size));
        }
        
        display() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.rotate(this.rotation);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(this.size);
          const alpha = this.isExplosion ? this.life : 255;
          p.fill(255, alpha);
          p.text(this.flag, 0, 0);
          p.pop();
        }
      }
      
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style('display', 'block');
        canvas.parent(containerRef.current!);
        
        // Initialize base particles
        for (let i = 0; i < baseParticles; i++) {
          particles.push(new Particle());
        }
      };
      
      p.mousePressed = () => {
        // Create explosion particles
        if (particles.length < maxParticles) {
          const numExplosion = Math.min(15, maxParticles - particles.length);
          for (let i = 0; i < numExplosion; i++) {
            particles.push(new Particle(p.mouseX, p.mouseY, true));
          }
        }
      };
      
      p.draw = () => {
        p.clear();
        
        // Update and display particles, remove dead ones
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].update();
          particles[i].display();
          
          if (particles[i].isDead()) {
            particles.splice(i, 1);
            // Replace dead explosion particles with ambient ones if below base count
            if (particles.length < baseParticles) {
              particles.push(new Particle());
            }
          }
        }
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    const p5Instance = new p5(sketch);
    
    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full bg-[#090909]" 
      style={{ zIndex: -1 }}
    />
  );
};

export default ChromaticSmoke;
