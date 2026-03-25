export type BlockType = "header" | "text" | "image" | "button" | "divider" | "spacer";

export interface EmailBlock {
  id: string;
  type: BlockType;
  props: Record<string, any>;
}

export const DEFAULT_BLOCK_PROPS: Record<BlockType, Record<string, any>> = {
  header: {
    text: "Your Headline Here",
    bgColor: "#16a34a",
    textColor: "#ffffff",
    fontSize: 24,
    padding: 32,
    align: "center",
  },
  text: {
    text: "Write your message here. Use merge tags like {first_name} to personalize.",
    fontSize: 14,
    textColor: "#555555",
    lineHeight: 1.6,
    padding: 24,
    align: "left",
  },
  image: {
    src: "",
    alt: "Image",
    width: 100,
    align: "center",
    padding: 16,
  },
  button: {
    text: "Click Here",
    href: "{tracking_link}",
    bgColor: "#16a34a",
    textColor: "#ffffff",
    borderRadius: 8,
    fontSize: 14,
    padding: 24,
    align: "center",
  },
  divider: {
    color: "#e5e7eb",
    thickness: 1,
    padding: 16,
  },
  spacer: {
    height: 32,
  },
};

export function blockToHtml(block: EmailBlock): string {
  const p = block.props;
  switch (block.type) {
    case "header":
      return `<div style="background:${p.bgColor};padding:${p.padding}px ${p.padding - 8}px;text-align:${p.align};">
  <h1 style="color:${p.textColor};margin:0;font-size:${p.fontSize}px;font-family:Arial,sans-serif;">${p.text}</h1>
</div>`;
    case "text":
      return `<div style="padding:${p.padding}px;text-align:${p.align};">
  <p style="font-size:${p.fontSize}px;color:${p.textColor};line-height:${p.lineHeight};margin:0;font-family:Arial,sans-serif;">${p.text}</p>
</div>`;
    case "image":
      if (!p.src) return `<div style="padding:${p.padding}px;text-align:${p.align};"><div style="background:#f1f5f9;padding:40px;border-radius:8px;color:#94a3b8;font-size:13px;font-family:Arial,sans-serif;">📷 Image placeholder</div></div>`;
      return `<div style="padding:${p.padding}px;text-align:${p.align};">
  <img src="${p.src}" alt="${p.alt}" style="width:${p.width}%;max-width:100%;height:auto;display:inline-block;" />
</div>`;
    case "button":
      return `<div style="padding:${p.padding}px;text-align:${p.align};">
  <a href="${p.href}" style="display:inline-block;background:${p.bgColor};color:${p.textColor};padding:12px 32px;border-radius:${p.borderRadius}px;text-decoration:none;font-weight:600;font-size:${p.fontSize}px;font-family:Arial,sans-serif;">${p.text}</a>
</div>`;
    case "divider":
      return `<div style="padding:${p.padding}px 24px;">
  <hr style="border:none;border-top:${p.thickness}px solid ${p.color};margin:0;" />
</div>`;
    case "spacer":
      return `<div style="height:${p.height}px;"></div>`;
    default:
      return "";
  }
}

export function blocksToHtml(blocks: EmailBlock[]): string {
  const inner = blocks.map(blockToHtml).join("\n");
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
${inner}
</div>`;
}
