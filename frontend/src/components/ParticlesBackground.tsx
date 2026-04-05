import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';

export const ParticlesBackground: React.FC = () => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
            options={{
                fullScreen: { enable: false, zIndex: 0 },
                particles: {
                    number: { value: 60, density: { enable: true, width: 800, height: 800 } },
                    color: { value: '#3b82f6' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: true },
                    size: { value: { min: 1, max: 3 } },
                    links: {
                        enable: true,
                        distance: 150,
                        color: '#6366f1',
                        opacity: 0.2,
                        width: 1,
                    },
                    move: {
                        enable: true,
                        speed: 0.8,
                        direction: 'none',
                        random: false,
                        straight: false,
                        outModes: 'out',
                    },
                },
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: 'grab' },
                    },
                    modes: {
                        grab: { distance: 200, links: { opacity: 0.5 } },
                    },
                },
            }}
        />
    );
};
