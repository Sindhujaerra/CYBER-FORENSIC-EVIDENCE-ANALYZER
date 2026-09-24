import Particles from "react-tsparticles";

export default function ParticlesBackground() {
  return (
    <Particles
      id="tsparticles"
      options={{
        background: {
          color: "#020617",
        },
        particles: {
          number: {
            value: 60,
          },
          color: {
            value: "#06b6d4",
          },
          links: {
            enable: true,
            color: "#06b6d4",
            opacity: 0.2,
          },
          move: {
            enable: true,
            speed: 1,
          },
          size: {
            value: 2,
          },
          opacity: {
            value: 0.5,
          },
        },
      }}
    />
  )
}
