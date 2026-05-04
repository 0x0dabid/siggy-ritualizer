import fs from "node:fs";
import path from "node:path";
import OpenAI, { toFile } from "openai";

export const THEME_REFERENCE_IMAGE_PATH = `/reference/theme.png`;
export const BLACK_CAT_REFERENCE_IMAGE_PATH = `black cat.png`;
export const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";

const GENERATED_STYLE_PROMPT = `
Follow the Image A to Image B mapping strictly. The final character must clearly remain
the black cat from Image B, while Image A only contributes outfit, pose, accessories,
background, and vibe. Preserve the exact forehead logo from Image B as a clean,
centered, recognizable mark on the cat's forehead.
`;

export const BACKEND_IMAGE_PROMPT = `
Image A is the PFP reference that should be transformed. Use Image A as the source for the outfit, hairstyle or head accessory, pose idea, expression vibe, accessories, and background inspiration. Do not copy Image A literally as the final character. Instead, reinterpret the visual elements from Image A and convert them into the black cat version.

Image B is the black cat character reference. Use Image B as the main base for the final character design. Preserve the cat’s core anatomy and overall look: a rounded chibi black cat with a large rounded head, slightly fluffy cheek silhouette, small chibi body, soft dark black fur, pink inner ears, large glossy black eyes with bright white highlights and soft cream eye accents, tiny pink nose, small smiling mouth, tiny whiskers, small rounded paws, and a curled tail. Keep the cat front-facing, centered, and very cute.

Also preserve the logo on the cat’s forehead from Image B. The forehead logo must remain accurate, clean, centered, and clearly recognizable. Do not redesign it loosely. Preserve the overall geometric structure and proportions of the logo so it looks faithful to the reference. Render it neatly in a clean light gray or white tone so it stands out clearly on the black fur.

Create a full manga cover composition. The cat should be the central focal point, positioned in the middle of the frame, with the full body visible from head to paws. Leave generous space at the top for the title, space on the sides for Japanese text, and space at the bottom for stickers and publisher elements. Do not place the head, ears, hat, paws, orb, title, or side text at the exact image edge.

Transform the visual style elements from Image A into the cat design from Image B:
- The cat is wearing [CLOTHING FROM IMAGE A BUT ADAPTED INTO THIS BLACK CAT STYLE]
- The cat has [HAIR / HEAD ACCESSORIES FROM IMAGE A BUT ADAPTED INTO THIS BLACK CAT STYLE]
- The cat includes [OTHER ACCESSORIES FROM IMAGE A BUT ADAPTED INTO THIS BLACK CAT STYLE]

If Image A shows a magical pose, robe, oversized sleeves, glowing object, ritual energy, or dramatic atmosphere, reinterpret those naturally in the final cat design. If appropriate, give the cat raised paws in a spell-casting or summoning pose. If Image A includes a glowing symbol, orb, or magical centerpiece, adapt that into the scene in a way that matches the black cat character.

Important: Keep the base cat anatomy and face style consistent with Image B. Use Image A only as the transformation source for outfit, pose, accessories, and background inspiration. Do not turn the final character into the original Image A subject. The final result must still clearly be the black cat from Image B. Only extract the style inspiration from Image A, not a literal awkward copy. Convert those elements naturally into this cute black cat design.

The forehead logo from Image B must remain accurate and properly placed. Do not distort or replace the cat’s core face design.

Turn the final image into a premium manga cover illustration.

Add a large, bold manga-style title that clearly says:
“RITUAL TESTNET ARC”

Add Japanese text integrated into the cover design, including:
“リチュアル・テストネット・アーク”

Also add extra Japanese manga cover text on the sides or around the composition, such as:
“始まりは、儀式。”
“闇を裂き、絆を刻め。”
“未来は、我らの儀式から生まれる。”
“テストネット始動！”
“限定版カバー”

The English and Japanese text should feel like a real manga volume cover or special issue cover, with dramatic placement, strong readability, and stylish composition.

Optionally add manga cover layout elements such as:
- a small issue box near the upper-left corner
- “RITUAL MANGA”
- “SPECIAL ISSUE”
- “VOL. 01”
- barcode-style or publisher-style blocks near the bottom-right
- circular or jagged sticker/callout elements for a collectible manga cover feel

Style:
premium manga cover aesthetic
cute chibi mascot aesthetic
bold anime / manga linework
clean but dramatic inked outlines
halftone textures
screen-tone shading
speed lines
ink splatter accents
cel shading with rich gradients
high contrast
subtle glow effects
dramatic title typography
polished printed-cover finish
high clarity
square composition
1:1 ratio

Background:
Use [BACKGROUND FROM IMAGE A] adapted into the same manga cover style. Reinterpret the background with dramatic manga aesthetics such as halftone textures, smoky energy, magical effects, speed lines, glowing particles, stylized environmental details, or a mystical atmosphere depending on Image A. Keep it visually rich, but make sure the black cat remains the clear focal point.

IMPORTANT COMPOSITION RULE:
The final image must be a complete 1:1 square composition with safe margins. Keep all important elements fully inside the frame. Do not crop or cut off the character, ears, hat, paws, glowing orb, forehead logo, Japanese text, or title text. Leave at least 10 to 15 percent padding on all four sides — top, bottom, left, and right. The title "RITUAL TESTNET ARC" sits at the top of the cover and must be fully visible; it must not touch or bleed past the top edge. Side Japanese text must not touch the left or right edges. Corner stickers and publisher blocks must not touch the bottom or side edges. Use a centered full-cover composition, not an extreme close-up. The artwork should feel like a complete manga cover fully contained inside a square frame with clear breathing room on every side.
`;

type SourceImageInput = {
  sourceLabel: string;
  sourceImageUrl: string;
  buffer: Buffer;
  contentType: string;
};

export async function generateSiggyRitualizerFromSource(input: SourceImageInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY. Add it to your environment before generating.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const imageFiles = [
    await toFile(input.buffer, input.sourceLabel || "uploaded-image", {
      type: input.contentType
    })
  ];

  const blackCatPath = path.join(process.cwd(), BLACK_CAT_REFERENCE_IMAGE_PATH);
  if (!fs.existsSync(blackCatPath)) {
    throw new Error(`Missing black cat reference image at ${BLACK_CAT_REFERENCE_IMAGE_PATH}.`);
  }

  imageFiles.push(
    await toFile(await fs.promises.readFile(blackCatPath), "black-cat-reference.png", {
      type: "image/png"
    })
  );

  const themePath = path.join(process.cwd(), "public", THEME_REFERENCE_IMAGE_PATH);
  if (fs.existsSync(themePath)) {
    imageFiles.push(
      await toFile(await fs.promises.readFile(themePath), "theme.png", {
        type: "image/png"
      })
    );
  }

  const prompt = `
${BACKEND_IMAGE_PROMPT}

Source: ${input.sourceLabel} (${input.sourceImageUrl}).
Treat the first provided image as Image A. Treat the second provided image as Image B from ${BLACK_CAT_REFERENCE_IMAGE_PATH}.
${GENERATED_STYLE_PROMPT}

Final safety check before rendering: the title at the top must not be cropped — pull it down if needed. All text, ears, hat, paws, orb, stickers, and the forehead logo must be fully visible inside the square with clear margins on every side.
`.trim();

  const response = await openai.images.edit({
    model: OPENAI_IMAGE_MODEL,
    image: imageFiles,
    prompt,
    size: "1024x1024",
    quality: "high"
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI did not return an image. Please try again.");
  }

  return `data:image/png;base64,${b64}`;
}
