import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CakeOrderDialogProps {
  listingId: string;
  cakeTitle: string;
  price: number;
}

export function CakeOrderDialog({ listingId, cakeTitle, price }: CakeOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [servings, setServings] = useState("");
  const [eventDate, setEventDate] = useState("");

  const handleSend = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Nom et email sont obligatoires.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("cake_orders").insert({
        cake_listing_id: listingId,
        buyer_name: name.trim(),
        buyer_email: email.trim(),
        buyer_phone: phone.trim() || null,
        message: message.trim() || null,
        servings: servings ? parseInt(servings) : null,
        event_date: eventDate || null,
      });
      if (error) throw error;
      toast.success("Votre demande a été envoyée au vendeur !");
      setOpen(false);
      setName(""); setEmail(""); setPhone(""); setMessage(""); setServings(""); setEventDate("");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-cobalt text-primary-foreground rounded-xl gap-1.5 text-xs">
          <MessageCircle className="w-3.5 h-3.5" /> Commander
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Commander « {cakeTitle} »</DialogTitle>
          <p className="text-sm text-muted-foreground">Prix : {price} €</p>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Votre nom *" value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
          <Input placeholder="Votre email *" type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" />
          <Input placeholder="Téléphone (optionnel)" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nb de parts" type="number" value={servings} onChange={e => setServings(e.target.value)} className="rounded-xl" />
            <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="rounded-xl" />
          </div>
          <Textarea placeholder="Message au vendeur..." value={message} onChange={e => setMessage(e.target.value)} className="rounded-xl min-h-[70px]" />
          <Button onClick={handleSend} disabled={sending} className="w-full gradient-cobalt text-primary-foreground rounded-xl py-3 h-auto font-semibold">
            {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4 mr-2" /> Envoyer la demande</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
