import { useState, useCallback, useRef } from "react";
import {
  Type, Image, MousePointerClick, Minus, ArrowUpDown, Heading,
  Trash2, GripVertical, ChevronUp, ChevronDown, Copy, Plus,
  AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type EmailBlock,
  type BlockType,
  DEFAULT_BLOCK_PROPS,
  blockToHtml,
  blocksToHtml,
} from "./types";

const BLOCK_PALETTE: { type: BlockType; label: string; icon: typeof Type }[] = [
  { type: "header", label: "Header", icon: Heading },
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "button", label: "Button", icon: MousePointerClick },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "spacer", label: "Spacer", icon: ArrowUpDown },
];

let idCounter = 0;
function genId() {
  return `blk_${Date.now()}_${++idCounter}`;
}

interface Props {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
}

export default function EmailBlockEditor({ blocks, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const historyRef = useRef<EmailBlock[][]>([[]]);
  const historyIndexRef = useRef(0);

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;

  const pushHistory = useCallback((newBlocks: EmailBlock[]) => {
    const idx = historyIndexRef.current;
    const newHistory = historyRef.current.slice(0, idx + 1);
    newHistory.push(JSON.parse(JSON.stringify(newBlocks)));
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, []);

  const handleChange = useCallback((newBlocks: EmailBlock[]) => {
    pushHistory(newBlocks);
    onChange(newBlocks);
  }, [onChange, pushHistory]);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    historyIndexRef.current = idx - 1;
    const restored = JSON.parse(JSON.stringify(historyRef.current[idx - 1]));
    onChange(restored);
  }, [onChange]);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;
    historyIndexRef.current = idx + 1;
    const restored = JSON.parse(JSON.stringify(historyRef.current[idx + 1]));
    onChange(restored);
  }, [onChange]);

  const clearAll = useCallback(() => {
    pushHistory([]);
    onChange([]);
    setSelectedId(null);
  }, [onChange, pushHistory]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const addBlock = useCallback((type: BlockType) => {
    const newBlock: EmailBlock = {
      id: genId(),
      type,
      props: { ...DEFAULT_BLOCK_PROPS[type] },
    };
    const updated = [...blocks, newBlock];
    handleChange(updated);
    setSelectedId(newBlock.id);
  }, [blocks, handleChange]);

  const updateBlockProps = useCallback((id: string, props: Record<string, any>) => {
    handleChange(blocks.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...props } } : b)));
  }, [blocks, handleChange]);

  const removeBlock = useCallback((id: string) => {
    handleChange(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [blocks, handleChange, selectedId]);

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const arr = [...blocks];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    handleChange(arr);
  }, [blocks, handleChange]);

  const duplicateBlock = useCallback((id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const dup: EmailBlock = { ...blocks[idx], id: genId(), props: { ...blocks[idx].props } };
    const arr = [...blocks];
    arr.splice(idx + 1, 0, dup);
    handleChange(arr);
    setSelectedId(dup.id);
  }, [blocks, handleChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">
      {/* Canvas */}
      <div className="space-y-3">
        {/* Block Palette + Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground font-medium mr-1">Add:</span>
          {BLOCK_PALETTE.map((bp) => {
            const Icon = bp.icon;
            return (
              <button
                key={bp.type}
                onClick={() => addBlock(bp.type)}
                className="inline-flex items-center gap-1.5 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors"
              >
                <Icon className="w-3 h-3" />
                {bp.label}
              </button>
            );
          })}
        </div>

        {/* Email Canvas */}
        <div className="bg-muted/30 rounded-xl border border-border p-4 min-h-[400px]">
          <div className="max-w-[620px] mx-auto bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Plus className="w-8 h-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">Click a block type above to start building</p>
              </div>
            )}
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                onClick={(e) => { e.stopPropagation(); setSelectedId(block.id); }}
                className={cn(
                  "relative group cursor-pointer transition-all",
                  selectedId === block.id
                    ? "ring-2 ring-primary ring-offset-1"
                    : "hover:ring-1 hover:ring-primary/30"
                )}
              >
                {/* Block toolbar */}
                <div className={cn(
                  "absolute -top-0.5 right-1 z-10 flex items-center gap-0.5 bg-card border border-border rounded-md shadow-sm px-0.5 py-0.5 transition-opacity",
                  selectedId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, -1); }} disabled={idx === 0}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 1); }} disabled={idx === blocks.length - 1}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                    className="p-0.5 rounded hover:bg-muted"><Copy className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                    className="p-0.5 rounded hover:bg-muted text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
                {/* Block preview */}
                <div dangerouslySetInnerHTML={{ __html: blockToHtml(block) }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-3 py-2.5 border-b border-border">
          <span className="text-xs font-bold text-foreground">
            {selectedBlock ? `${selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)} Properties` : "Properties"}
          </span>
        </div>
        <ScrollArea className="h-[440px]">
          <div className="p-3 space-y-3">
            {!selectedBlock && (
              <p className="text-[10px] text-muted-foreground text-center py-8">Click a block to edit its properties</p>
            )}
            {selectedBlock && (
              <BlockProperties block={selectedBlock} onUpdate={(p) => updateBlockProps(selectedBlock.id, p)} />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Block Property Editor ───

function BlockProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (p: Record<string, any>) => void }) {
  const p = block.props;

  const AlignPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
      {[{ v: "left", I: AlignLeft }, { v: "center", I: AlignCenter }, { v: "right", I: AlignRight }].map(({ v, I }) => (
        <button key={v} onClick={() => onChange(v)} className={cn("p-1 rounded", value === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
          <I className="w-3 h-3" />
        </button>
      ))}
    </div>
  );

  const ColorField = ({ label, value, prop }: { label: string; value: string; prop: string }) => (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onUpdate({ [prop]: e.target.value })}
          className="w-7 h-7 rounded-md border border-border cursor-pointer p-0.5" />
        <Input value={value} onChange={(e) => onUpdate({ [prop]: e.target.value })}
          className="h-7 text-[10px] font-mono flex-1" />
      </div>
    </div>
  );

  const SliderField = ({ label, value, prop, min, max, unit = "px" }: { label: string; value: number; prop: string; min: number; max: number; unit?: string }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] text-muted-foreground">{label}</Label>
        <span className="text-[9px] text-muted-foreground">{value}{unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onUpdate({ [prop]: v })} min={min} max={max} step={1} className="py-1" />
    </div>
  );

  switch (block.type) {
    case "header":
      return (
        <>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Headline</Label>
            <Input value={p.text} onChange={(e) => onUpdate({ text: e.target.value })} className="h-7 text-xs" />
          </div>
          <ColorField label="Background" value={p.bgColor} prop="bgColor" />
          <ColorField label="Text Color" value={p.textColor} prop="textColor" />
          <SliderField label="Font Size" value={p.fontSize} prop="fontSize" min={16} max={48} />
          <SliderField label="Padding" value={p.padding} prop="padding" min={8} max={64} />
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Alignment</Label>
            <AlignPicker value={p.align} onChange={(v) => onUpdate({ align: v })} />
          </div>
        </>
      );

    case "text":
      return (
        <>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Content</Label>
            <Textarea value={p.text} onChange={(e) => onUpdate({ text: e.target.value })} className="min-h-[100px] text-xs" />
          </div>
          <ColorField label="Text Color" value={p.textColor} prop="textColor" />
          <SliderField label="Font Size" value={p.fontSize} prop="fontSize" min={10} max={24} />
          <SliderField label="Line Height" value={p.lineHeight} prop="lineHeight" min={1} max={2.5} unit="" />
          <SliderField label="Padding" value={p.padding} prop="padding" min={0} max={64} />
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Alignment</Label>
            <AlignPicker value={p.align} onChange={(v) => onUpdate({ align: v })} />
          </div>
        </>
      );

    case "image":
      return (
        <>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Image URL</Label>
            <Input value={p.src} onChange={(e) => onUpdate({ src: e.target.value })} placeholder="https://..." className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Alt Text</Label>
            <Input value={p.alt} onChange={(e) => onUpdate({ alt: e.target.value })} className="h-7 text-xs" />
          </div>
          <SliderField label="Width" value={p.width} prop="width" min={20} max={100} unit="%" />
          <SliderField label="Padding" value={p.padding} prop="padding" min={0} max={64} />
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Alignment</Label>
            <AlignPicker value={p.align} onChange={(v) => onUpdate({ align: v })} />
          </div>
        </>
      );

    case "button":
      return (
        <>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Button Text</Label>
            <Input value={p.text} onChange={(e) => onUpdate({ text: e.target.value })} className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Link URL</Label>
            <Input value={p.href} onChange={(e) => onUpdate({ href: e.target.value })} className="h-7 text-xs" />
          </div>
          <ColorField label="Button Color" value={p.bgColor} prop="bgColor" />
          <ColorField label="Text Color" value={p.textColor} prop="textColor" />
          <SliderField label="Font Size" value={p.fontSize} prop="fontSize" min={10} max={24} />
          <SliderField label="Border Radius" value={p.borderRadius} prop="borderRadius" min={0} max={32} />
          <SliderField label="Padding" value={p.padding} prop="padding" min={0} max={64} />
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Alignment</Label>
            <AlignPicker value={p.align} onChange={(v) => onUpdate({ align: v })} />
          </div>
        </>
      );

    case "divider":
      return (
        <>
          <ColorField label="Color" value={p.color} prop="color" />
          <SliderField label="Thickness" value={p.thickness} prop="thickness" min={1} max={6} />
          <SliderField label="Padding" value={p.padding} prop="padding" min={0} max={48} />
        </>
      );

    case "spacer":
      return (
        <SliderField label="Height" value={p.height} prop="height" min={8} max={120} />
      );

    default:
      return null;
  }
}

export { blocksToHtml };
