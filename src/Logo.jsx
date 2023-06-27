import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useScrollbar, useTracker } from '@14islands/r3f-scroll-rig';
import LogoSVG from './triangle.svg'; // Import the SVG file

export default function Logo(props) {
  const el = useRef();
  const { onScroll } = useScrollbar();
  const { scrollState } = useTracker(el);
  const progress = useMotionValue(0);

  useEffect(() => {
    return onScroll(() => progress.set(scrollState.visibility));
  }, [onScroll, progress, scrollState]);

  const y = useTransform(progress, [0, 1], ['-100%', '0%']);
  const opacity = useTransform(progress, [0, 1], [0, 1]);
  const scale = useTransform(progress, [0, 1], [0.9, 1]);

  return (
    <div
      ref={el}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '22vw',
        paddingBottom: '14vw',
        paddingTop: '34vw'

      }}
    >
      <motion.a
        style={{ y, opacity, scale, width: '50%' }}
        href="https://14islands.com"
        target="_blank"
        rel="noreferrer"
      >
        <img src={LogoSVG} alt={props.text} /> {/* Replace the <svg> with <img> */}
      </motion.a>
    </div>
  );
}
