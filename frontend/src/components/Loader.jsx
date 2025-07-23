import { motion } from "motion/react";
import { useEffect, useState } from "react";

const NUM_STRIPS = 20;

export default function Loader() {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-black h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full flex">
        {[...Array(NUM_STRIPS)].map((_, i) => {
          const widthPercent = 100 / NUM_STRIPS;
          const offset = -(i * viewportWidth) / NUM_STRIPS;

          return (
            <motion.div
              key={i}
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              transition={{
                delay: i * 0.1,
                duration: 0.8,
                ease: "easeOut",
              }}
              className="h-full overflow-hidden"
              style={{
                width: `${widthPercent}%`,
              }}
            >
              <div
                className="h-full bg-no-repeat bg-cover"
                style={{
                  width: viewportWidth,
                  backgroundImage: `url("/ryuk.png")`, // <-- this is correct
                  backgroundPositionX: `${offset}px`,
                  backgroundPositionY: "top",
                }}
              />
              Loading
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
