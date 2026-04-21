import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Mail, Phone, Calendar, Users, ChevronDown, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Order {
  id: string;
  cake_listing_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string | null;
  servings: number | null;
  event_date: string | null;
  status: string;
  created_at: string;
  cake_title?: string;
}

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "En attente", color: "text-amber-400 bg-amber-400/10 border-amber-400/30", icon: Clock },
  accepted: { label: "Acceptée", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", icon: CheckCircle2 },
  declined: { label: "Refusée", color: "text-rose-400 bg-rose-400/10 border-rose-400/30", icon: XCircle },
};

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Get user's listings first
    const { data: listings } = await supabase
      .from("cake_listings")
      .select("id, title")
      .eq("user_id", user.id);

    if (!listings || listings.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const titleMap = new Map(listings.map((l) => [l.id, l.title]));
    const ids = listings.map((l) => l.id);

    const { data: ordersData } = await supabase
      .from("cake_orders")
      .select("*")
      .in("cake_listing_id", ids)
      .order("created_at", { ascending: false });

    if (ordersData) {
      setOrders(
        ordersData.map((o: any) => ({
          ...o,
          cake_title: titleMap.get(o.cake_listing_id) || "Gâteau",
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchOrders();
  }, [open, user]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const { error } = await supabase.from("cake_orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erreur lors de la mise à jour.");
    } else {
      toast.success(`Commande ${status === "accepted" ? "acceptée" : "refusée"}.`);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
    setUpdating(null);
  };

  if (!user) return null;

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="font-display font-semibold text-sm">Mes commandes reçues</h2>
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0 ? `${pendingCount} en attente` : "Gérez les demandes des acheteurs"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground">
              {pendingCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-border space-y-3">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Aucune commande pour le moment.
                </p>
              ) : (
                orders.map((order) => {
                  const meta = STATUS_META[order.status] || STATUS_META.pending;
                  const StatusIcon = meta.icon;
                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-border bg-background p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-display font-semibold text-sm">{order.cake_title}</p>
                          <p className="text-xs text-muted-foreground">
                            Demande de <span className="font-medium text-foreground">{order.buyer_name}</span>
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-1 rounded-full border flex items-center gap-1 ${meta.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <a
                          href={`mailto:${order.buyer_email}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                        >
                          <Mail className="w-3 h-3" /> {order.buyer_email}
                        </a>
                        {order.buyer_phone && (
                          <a
                            href={`tel:${order.buyer_phone}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                          >
                            <Phone className="w-3 h-3" /> {order.buyer_phone}
                          </a>
                        )}
                        {order.event_date && (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.event_date).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        {order.servings && (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-3 h-3" /> {order.servings} parts
                          </span>
                        )}
                      </div>

                      {order.message && (
                        <p className="text-xs bg-secondary/50 rounded-lg p-3 text-muted-foreground italic">
                          « {order.message} »
                        </p>
                      )}

                      {order.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, "accepted")}
                            className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, "declined")}
                            className="flex-1 h-8 text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Refuser
                          </Button>
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground">
                        Reçue le {new Date(order.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
