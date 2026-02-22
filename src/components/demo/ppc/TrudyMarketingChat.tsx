 import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Sparkles, Image, Loader2, Download, Copy, ExternalLink, Check, Layout, TrendingUp, Search, Target, Trash2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Badge } from "@/components/ui/badge";
 import { toast } from "sonner";
 import ReactMarkdown from "react-markdown";
 import { cn } from "@/lib/utils";
 import trudyAvatar from "@/assets/trudy-avatar.png";
 import { PlatformLaunchGuide } from "./PlatformLaunchGuide";
 import { GeneratedAdPreview } from "./GeneratedAdPreview";
 
 interface Message {
   id: string;
   role: "user" | "assistant";
   content: string;
   timestamp: Date;
   image?: string;
   adCopy?: {
     headline: string;
     description: string;
     cta: string;
   };
 }
 
 interface TrudyMarketingChatProps {
   onNavigate?: (section: string) => void;
   onCreateLandingPage?: () => void;
 }
 
 const QUICK_PROMPTS = [
   { id: "ad", label: "Create an Ad", icon: Image, prompt: "Help me create an ad for TruMove" },
   { id: "landing", label: "Landing Page", icon: Layout, prompt: "Build a landing page for California moves" },
   { id: "keywords", label: "Find Keywords", icon: Search, prompt: "What keywords should I target for moving services?" },
   { id: "optimize", label: "Optimize Campaign", icon: TrendingUp, prompt: "How can I improve my campaign performance?" },
 ];
 
 const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketing-ai-assistant`;
 
const STORAGE_KEY = "trudy_marketing_chat_history";
const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm Trudy, your AI marketing assistant. 🎨\n\nI can help you:\n- **Create ads** with custom images\n- **Build landing pages**\n- **Find keywords** for your campaigns\n- **Launch on Google, Meta, or TikTok**\n\nWhat would you like to create today?",
  timestamp: new Date(),
};

// Helper to load messages from storage
const loadMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Restore Date objects
      return parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (e) {
    console.warn("Failed to load chat history:", e);
  }
  return [WELCOME_MESSAGE];
};

// Helper to save messages to storage
const saveMessagesToStorage = (messages: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn("Failed to save chat history:", e);
  }
};

 export function TrudyMarketingChat({ onNavigate, onCreateLandingPage }: TrudyMarketingChatProps) {
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage);
   const [input, setInput] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [isGeneratingImage, setIsGeneratingImage] = useState(false);
   const [showLaunchGuide, setShowLaunchGuide] = useState(false);
   const [selectedPlatform, setSelectedPlatform] = useState<"google" | "meta" | "tiktok" | null>(null);
   const [generatedAd, setGeneratedAd] = useState<{ image?: string; copy?: { headline: string; description: string; cta: string } } | null>(null);
   const [copiedText, setCopiedText] = useState<string | null>(null);
   
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLTextAreaElement>(null);
 
   // Auto-scroll to bottom
   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);
 
  // Persist messages to localStorage whenever they change
  useEffect(() => {
    // Don't save if only welcome message exists
    if (messages.length > 1 || messages[0]?.id !== "welcome") {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

   // Detect if user is asking for an image
   const detectImageRequest = (text: string): string | null => {
     const lowerText = text.toLowerCase();
     const imageKeywords = ["image", "picture", "photo", "visual", "graphic", "design", "create an ad", "ad with", "show me", "generate"];
     const hasImageKeyword = imageKeywords.some(k => lowerText.includes(k));
     
     // Look for specific imagery requests
     const imageryPatterns = [
       /with\s+(?:a\s+)?(\w+(?:\s+\w+)?)/i,
       /featuring\s+(?:a\s+)?(\w+(?:\s+\w+)?)/i,
       /showing\s+(?:a\s+)?(\w+(?:\s+\w+)?)/i,
       /include\s+(?:a\s+)?(\w+(?:\s+\w+)?)/i,
     ];
     
     for (const pattern of imageryPatterns) {
       const match = text.match(pattern);
       if (match && hasImageKeyword) {
         return match[1];
       }
     }
     
     if (hasImageKeyword) {
       return text;
     }
     
     return null;
   };

    // Detect if user is asking for a landing page
    const detectLandingPageRequest = (text: string): boolean => {
      const lowerText = text.toLowerCase();
      const landingKeywords = [
        // Direct landing page mentions
        "landing page",
        "landing-page",
        "landingpage",
        // Page creation phrases
        "build a page",
        "create a page",
        "make a page",
        "new page",
        "build page",
        "create page",
        "design page",
        "make page",
        // Form/lead capture related
        "create a form",
        "build a form",
        "lead capture",
        "lead form",
        "capture form",
        "contact form",
        "quote form",
        "signup form",
        "sign-up form",
        "opt-in form",
        "optin form",
        "email capture",
        "collect leads",
        "generate leads",
        // Funnel related
        "funnel",
        "sales funnel",
        "lead funnel",
        "marketing funnel",
        "conversion funnel",
        // Page types
        "quote page",
        "lead page",
        "squeeze page",
        "conversion page",
        "sales page",
        "promo page",
        "promotional page",
        "offer page",
        "signup page",
        "sign-up page",
        "opt-in page",
        "optin page",
        "thank you page",
        "confirmation page",
        // Campaign/marketing pages
        "campaign page",
        "ppc page",
        "ad page",
        "ads page",
        "microsite",
        "mini site",
      ];
      return landingKeywords.some(k => lowerText.includes(k));
    };
 
   // Stream chat response
   const streamChat = async (userMessage: string) => {
     const allMessages = [...messages, { role: "user" as const, content: userMessage }]
       .filter(m => m.role === "user" || m.role === "assistant")
       .map(m => ({ role: m.role, content: m.content }));
 
     const resp = await fetch(CHAT_URL, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
       },
       body: JSON.stringify({ messages: allMessages }),
     });
 
     if (!resp.ok) {
       const errorData = await resp.json().catch(() => ({}));
       throw new Error(errorData.error || "Failed to get response");
     }
 
     const reader = resp.body?.getReader();
     if (!reader) throw new Error("No response body");
 
     const decoder = new TextDecoder();
     let textBuffer = "";
     let assistantContent = "";
 
     while (true) {
       const { done, value } = await reader.read();
       if (done) break;
 
       textBuffer += decoder.decode(value, { stream: true });
 
       let newlineIndex: number;
       while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
         let line = textBuffer.slice(0, newlineIndex);
         textBuffer = textBuffer.slice(newlineIndex + 1);
 
         if (line.endsWith("\r")) line = line.slice(0, -1);
         if (line.startsWith(":") || line.trim() === "") continue;
         if (!line.startsWith("data: ")) continue;
 
         const jsonStr = line.slice(6).trim();
         if (jsonStr === "[DONE]") break;
 
         try {
           const parsed = JSON.parse(jsonStr);
           const content = parsed.choices?.[0]?.delta?.content as string | undefined;
           if (content) {
             assistantContent += content;
             // Update the last assistant message
             setMessages(prev => {
               const last = prev[prev.length - 1];
               if (last?.role === "assistant" && last.id.startsWith("stream-")) {
                 return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
               }
               return [...prev, {
                 id: `stream-${Date.now()}`,
                 role: "assistant" as const,
                 content: assistantContent,
                 timestamp: new Date(),
               }];
             });
           }
         } catch {
           textBuffer = line + "\n" + textBuffer;
           break;
         }
       }
     }
 
     return assistantContent;
   };
 
   // Generate image
   const generateImage = async (imagePrompt: string) => {
     const resp = await fetch(CHAT_URL, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
       },
       body: JSON.stringify({ 
         generateImage: true, 
         imagePrompt,
         messages: []
       }),
     });
 
     if (!resp.ok) {
       const errorData = await resp.json().catch(() => ({}));
       throw new Error(errorData.error || "Failed to generate image");
     }
 
     return resp.json();
   };
 
   const handleSend = useCallback(async () => {
     if (!input.trim() || isLoading) return;
 
     const userMessage = input.trim();
     setInput("");
     setIsLoading(true);
 
     // Add user message
     setMessages(prev => [...prev, {
       id: `user-${Date.now()}`,
       role: "user",
       content: userMessage,
       timestamp: new Date(),
     }]);
 
     try {
        // Check if user is requesting a landing page
        const isLandingPageRequest = detectLandingPageRequest(userMessage);
        
        if (isLandingPageRequest && onCreateLandingPage) {
          // Add response and trigger wizard
          setMessages(prev => [...prev, {
            id: `lp-${Date.now()}`,
            role: "assistant",
            content: "🚀 **Great choice!** I'm opening the Landing Page Wizard for you now.\n\nYou'll be able to:\n- Choose from 6 high-converting templates\n- Customize colors, copy, and CTAs\n- Preview and publish instantly\n\n*Opening wizard...*",
            timestamp: new Date(),
          }]);
          
          // Small delay for UX, then trigger the wizard
          setTimeout(() => {
            onCreateLandingPage();
          }, 800);
          
          setIsLoading(false);
          return;
        }
        
        // Check if user is requesting an image
       const imageRequest = detectImageRequest(userMessage);
       
       if (imageRequest) {
         setIsGeneratingImage(true);
         
         // Add thinking message
         setMessages(prev => [...prev, {
           id: `stream-${Date.now()}`,
           role: "assistant",
           content: "🎨 Creating your ad image... This may take a moment.",
           timestamp: new Date(),
         }]);
 
         // Generate image
         const imageResult = await generateImage(imageRequest);
         
         if (imageResult.type === "image" && imageResult.image) {
           setGeneratedAd({ image: imageResult.image });
           
           // Update message with image
           setMessages(prev => {
             const filtered = prev.filter(m => !m.id.startsWith("stream-"));
             return [...filtered, {
               id: `img-${Date.now()}`,
               role: "assistant",
               content: `Here's your custom ad image! 🎉\n\n${imageResult.description || "I've created a professional marketing image featuring your requested elements."}\n\n**Ready to launch?** Choose a platform below to get started.`,
               timestamp: new Date(),
               image: imageResult.image,
             }];
           });
         } else {
           // Fallback to text response
           await streamChat(userMessage);
         }
         
         setIsGeneratingImage(false);
       } else {
         // Regular text chat
         await streamChat(userMessage);
       }
     } catch (error) {
       console.error("Chat error:", error);
       toast.error(error instanceof Error ? error.message : "Failed to send message");
       
       setMessages(prev => {
         const filtered = prev.filter(m => !m.id.startsWith("stream-"));
         return [...filtered, {
           id: `error-${Date.now()}`,
           role: "assistant",
           content: "I'm sorry, I encountered an error. Please try again.",
           timestamp: new Date(),
         }];
       });
     } finally {
       setIsLoading(false);
       setIsGeneratingImage(false);
     }
   }, [input, isLoading, messages]);
 
   const handleQuickPrompt = (prompt: string) => {
     setInput(prompt);
     inputRef.current?.focus();
   };
 
  const handleClearHistory = () => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Chat history cleared");
  };

   const handleCopy = async (text: string, label: string) => {
     await navigator.clipboard.writeText(text);
     setCopiedText(label);
     toast.success(`${label} copied!`);
     setTimeout(() => setCopiedText(null), 2000);
   };
 
   const handleDownloadImage = (imageUrl: string) => {
     const link = document.createElement("a");
     link.href = imageUrl;
     link.download = `trumove-ad-${Date.now()}.png`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     toast.success("Image downloaded!");
   };
 
   const handleLaunch = (platform: "google" | "meta" | "tiktok") => {
     setSelectedPlatform(platform);
     setShowLaunchGuide(true);
   };
 
   return (
     <div className="flex flex-col h-full bg-background rounded-xl border border-border overflow-hidden">
       {/* Header */}
       <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
         <div className="relative">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
             <Bot className="w-5 h-5 text-white" />
           </div>
           <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
         </div>
         <div className="flex-1">
           <div className="flex items-center gap-2">
             <span className="font-semibold text-foreground">Trudy</span>
             <Badge variant="secondary" className="text-[10px] px-1.5 py-0">AI Marketing</Badge>
              {messages.length > 1 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  {messages.length - 1} messages
                </Badge>
              )}
           </div>
           <span className="text-xs text-muted-foreground">Create ads, landing pages & more</span>
         </div>
          <div className="flex items-center gap-1">
            {messages.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={handleClearHistory}
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
       </div>
 
       {/* Messages */}
       <ScrollArea className="flex-1 p-4">
         <div className="space-y-4">
           {messages.map((msg) => (
             <div
               key={msg.id}
               className={cn(
                 "flex gap-3",
                 msg.role === "user" ? "flex-row-reverse" : "flex-row"
               )}
             >
               {msg.role === "assistant" && (
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                   <Bot className="w-4 h-4 text-white" />
                 </div>
               )}
               
               <div className={cn(
                 "max-w-[80%] rounded-2xl px-4 py-3",
                 msg.role === "user" 
                   ? "bg-primary text-primary-foreground" 
                   : "bg-muted"
               )}>
                 <div className="prose prose-sm dark:prose-invert max-w-none">
                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                 </div>
                 
                 {/* Generated Image */}
                 {msg.image && (
                   <div className="mt-3 space-y-3">
                     <div className="relative rounded-xl overflow-hidden border border-border">
                       <img 
                         src={msg.image} 
                         alt="Generated ad" 
                         className="w-full h-auto"
                       />
                       <div className="absolute top-2 right-2 flex gap-1">
                         <Button
                           size="sm"
                           variant="secondary"
                           className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                           onClick={() => handleDownloadImage(msg.image!)}
                         >
                           <Download className="w-3.5 h-3.5" />
                         </Button>
                       </div>
                     </div>
                     
                     {/* Platform Launch Buttons */}
                     <div className="flex flex-wrap gap-2">
                       <span className="text-xs text-muted-foreground w-full">Launch on:</span>
                       {[
                         { id: "google", label: "Google Ads", color: "bg-blue-500" },
                         { id: "meta", label: "Meta/Facebook", color: "bg-indigo-500" },
                         { id: "tiktok", label: "TikTok", color: "bg-pink-500" },
                       ].map((platform) => (
                         <Button
                           key={platform.id}
                           size="sm"
                           variant="outline"
                           className="h-7 text-xs gap-1.5"
                           onClick={() => handleLaunch(platform.id as "google" | "meta" | "tiktok")}
                         >
                           <div className={cn("w-2 h-2 rounded-full", platform.color)} />
                           {platform.label}
                           <ExternalLink className="w-3 h-3" />
                         </Button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>
           ))}
           
           {/* Loading indicator */}
           {isLoading && !isGeneratingImage && messages[messages.length - 1]?.role === "user" && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                 <Bot className="w-4 h-4 text-white" />
               </div>
               <div className="bg-muted rounded-2xl px-4 py-3">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span className="text-sm">Thinking...</span>
                 </div>
               </div>
             </div>
           )}
           
           <div ref={messagesEndRef} />
         </div>
       </ScrollArea>
 
       {/* Quick Prompts - show only initially */}
       {messages.length === 1 && (
         <div className="px-4 pb-2">
           <div className="flex flex-wrap gap-2">
             {QUICK_PROMPTS.map((prompt) => {
               const Icon = prompt.icon;
               return (
                 <button
                   key={prompt.id}
                   onClick={() => handleQuickPrompt(prompt.prompt)}
                   className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-muted hover:bg-accent transition-colors"
                 >
                   <Icon className="w-3 h-3" />
                   {prompt.label}
                 </button>
               );
             })}
           </div>
         </div>
       )}
 
       {/* Input */}
       <div className="p-4 border-t border-border">
         <div className="flex gap-2">
           <textarea
             ref={inputRef}
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === "Enter" && !e.shiftKey) {
                 e.preventDefault();
                 handleSend();
               }
             }}
             placeholder="Ask Trudy to create ads, landing pages, or anything marketing..."
             className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] max-h-[120px]"
             rows={1}
             disabled={isLoading}
           />
           <Button
             onClick={handleSend}
             disabled={!input.trim() || isLoading}
             className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
           >
             {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
               <Send className="w-5 h-5" />
             )}
           </Button>
         </div>
         <p className="text-[10px] text-muted-foreground mt-2 text-center">
           Try: "Create an ad with a llama" or "Build a landing page for LA"
         </p>
       </div>
 
       {/* Platform Launch Guide Modal */}
       {showLaunchGuide && selectedPlatform && (
         <PlatformLaunchGuide
           platform={selectedPlatform}
           onClose={() => setShowLaunchGuide(false)}
           adImage={generatedAd?.image}
           adCopy={generatedAd?.copy}
         />
       )}
     </div>
   );
 }