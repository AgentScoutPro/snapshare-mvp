import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PIXEL_OWL_ASSETS,
  PIXEL_OWL_POSES,
  PIXEL_OWL_SIZES,
  PixelOwl,
} from "../PixelOwl";

describe("PixelOwl", () => {
  it("defaults to the neutral 120px mascot", () => {
    const markup = renderToStaticMarkup(<PixelOwl />);

    expect(markup).toContain('data-pose="Neutral"');
    expect(markup).toContain('data-size="120"');
    expect(markup).toContain("width:120px;height:120px");
    expect(markup).toContain(PIXEL_OWL_ASSETS.Neutral);
  });

  it("exposes the final Figma pose and size variant API", () => {
    expect(PIXEL_OWL_POSES).toEqual([
      "Celebrate",
      "ThumbsUp",
      "Neutral",
      "Sparkle",
      "Wings",
      "Curious",
      "Perched",
      "Flying",
    ]);
    expect(PIXEL_OWL_SIZES).toEqual([60, 80, 120, 160, 200]);
  });

  it("uses stable local PNG paths and crisp pixel rendering", () => {
    const markup = renderToStaticMarkup(<PixelOwl pose="Sparkle" size={160} />);

    expect(markup).toContain("/assets/images/owl/pixel-owl-sparkle.png");
    expect(markup).not.toContain("figma.com");
    expect(markup).toContain("image-rendering:pixelated");
    expect(markup).toContain("object-fit:contain");
  });

  it("keeps the flying pose contained inside the selected size box", () => {
    const markup = renderToStaticMarkup(<PixelOwl pose="Flying" size={160} />);

    expect(markup).toContain('data-pose="Flying"');
    expect(markup).toContain('data-size="160"');
    expect(markup).toContain("width:160px;height:160px");
    expect(markup).toContain("/assets/images/owl/pixel-owl-flying.png");
    expect(markup).toContain("object-fit:contain");
  });
});
