import { MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const WhatsAppButton = () => {
  const { getSection, loading } = useSiteContent();
  const settings = getSection("settings");
  
  const number = settings.whatsapp_number || "";
  const message = settings.whatsapp_message || "";
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  if (loading || !number) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" />
    </a>
  );
};

export default WhatsAppButton;
