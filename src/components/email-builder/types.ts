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
      return `<div style="background:${p.bgColor};padding:${p.padding}px 32px;text-align:${p.align};">
  <h1 style="color:${p.textColor};margin:0;font-size:${p.fontSize}px;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:-0.3px;line-height:1.25;">${p.text}</h1>
</div>`;
    case "text": {
      const html = (p.text as string).replace(/\n/g, "<br/>");
      return `<div style="padding:${p.padding}px 32px;text-align:${p.align};">
  <p style="font-size:${p.fontSize}px;color:${p.textColor};line-height:${p.lineHeight};margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${html}</p>
</div>`;
    }
    case "image":
      if (!p.src) return `<div style="padding:${p.padding}px 32px;text-align:${p.align};"><div style="background:#f8f9fa;padding:40px;border-radius:8px;color:#adb5bd;font-size:13px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;border:1px dashed #dee2e6;">📷 Image placeholder — paste a URL in the editor</div></div>`;
      return `<div style="padding:${p.padding}px 32px;text-align:${p.align};">
  <img src="${p.src}" alt="${p.alt}" style="width:${p.width}%;max-width:100%;height:auto;display:inline-block;border-radius:4px;" />
</div>`;
    case "button":
      return `<div style="padding:${p.padding}px 32px;text-align:${p.align};">
  <a href="${p.href}" style="display:inline-block;background:${p.bgColor};color:${p.textColor};padding:14px 36px;border-radius:${p.borderRadius}px;text-decoration:none;font-weight:600;font-size:${p.fontSize}px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.2px;mso-padding-alt:0;text-align:center;">${p.text}</a>
</div>`;
    case "divider":
      return `<div style="padding:${p.padding}px 32px;">
  <hr style="border:none;border-top:${p.thickness}px solid ${p.color};margin:0;" />
</div>`;
    case "spacer":
      return `<div style="height:${p.height}px;font-size:0;line-height:0;">&nbsp;</div>`;
    default:
      return "";
  }
}

export function blocksToHtml(blocks: EmailBlock[]): string {
  const inner = blocks.map(blockToHtml).join("\n");
  return `<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #eaeaea;">
${inner}
</div>`;
}
