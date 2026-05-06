import type { CSSProperties, ImgHTMLAttributes } from "react";

export type PixelOwlPose =
  | "Celebrate"
  | "ThumbsUp"
  | "Neutral"
  | "Sparkle"
  | "Wings"
  | "Curious"
  | "Perched"
  | "Flying";

export type PixelOwlSize = 60 | 80 | 120 | 160 | 200;

export const PIXEL_OWL_POSES = [
  "Celebrate",
  "ThumbsUp",
  "Neutral",
  "Sparkle",
  "Wings",
  "Curious",
  "Perched",
  "Flying",
] as const satisfies readonly PixelOwlPose[];

export const PIXEL_OWL_SIZES = [60, 80, 120, 160, 200] as const satisfies
  readonly PixelOwlSize[];

type PixelOwlProps = {
  pose?: PixelOwlPose;
  size?: PixelOwlSize;
  className?: string;
  alt?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "height" | "src" | "width">;

export const PIXEL_OWL_ASSETS: Record<PixelOwlPose, string> = {
  Celebrate: "/assets/images/owl/pixel-owl-celebrate.png",
  ThumbsUp: "/assets/images/owl/pixel-owl-thumbs-up.png",
  Neutral: "/assets/images/owl/pixel-owl-neutral.png",
  Sparkle: "/assets/images/owl/pixel-owl-sparkle.png",
  Wings: "/assets/images/owl/pixel-owl-wings.png",
  Curious: "/assets/images/owl/pixel-owl-curious.png",
  Perched: "/assets/images/owl/pixel-owl-perched.png",
  Flying: "/assets/images/owl/pixel-owl-flying.png",
};

export const PIXEL_OWL_USAGE: Record<PixelOwlPose, string> = {
  Celebrate: "success",
  ThumbsUp: "confirmation",
  Neutral: "default",
  Sparkle: "AI and premium",
  Wings: "onboarding",
  Curious: "empty or error",
  Perched: "profile or idle",
  Flying: "loading or transition",
};

export function PixelOwl({
  pose = "Neutral",
  size = 120,
  className,
  alt,
  style,
  ...imageProps
}: PixelOwlProps) {
  const wrapperStyle: CSSProperties = {
    width: size,
    height: size,
  };
  const imageStyle: CSSProperties = {
    ...style,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    imageRendering: "pixelated",
  };

  return (
    <span
      className={className ? `pixel-owl ${className}` : "pixel-owl"}
      style={wrapperStyle}
      data-pose={pose}
      data-size={size}
    >
      <img
        {...imageProps}
        src={PIXEL_OWL_ASSETS[pose]}
        alt={alt ?? `Pixel owl mascot, ${PIXEL_OWL_USAGE[pose]} pose`}
        draggable={false}
        style={imageStyle}
      />
    </span>
  );
}
