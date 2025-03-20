"use client";

import clsx from "clsx";
import { forwardRef } from "react";

interface VideoProps {
  src: string;
  onPlay: () => void;
  onPause: () => void;
  className?: string;
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(
  ({ src, onPlay, onPause, className }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        controls
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onPause}
        crossOrigin="anonymous"
        className={clsx("w-full h-full", className)}
      />
    );
  }
);

export default Video;
