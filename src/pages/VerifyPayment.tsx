import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ordersAPI } from "@/services/ordersAPI";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, Loader } from "lucide-react";

const VerifyPayment = () => {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying payment...");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all query parameters from Khalti
        const pidx = searchParams.get("pidx");
        const transactionId = searchParams.get("transaction_id");
        const khaltiStatus = searchParams.get("status");
        const purchaseOrderId = searchParams.get("purchase_order_id");
        const amount = searchParams.get("amount");

        if (!pidx || !transactionId || !khaltiStatus || !purchaseOrderId || !amount) {
          setStatus("error");
          setMessage("Missing required payment parameters");
          setLoading(false);
          return;
        }

        // Call our API to verify the payment
        const response = await ordersAPI.verifyPayment(
          pidx,
          transactionId,
          khaltiStatus,
          purchaseOrderId,
          parseInt(amount)
        );

        if (response.success) {
          setStatus("success");
          setMessage("Payment verified successfully! Your order has been confirmed.");
          setOrderId(response.order_id);
          toast({ title: "Payment successful!", description: "Thank you for your purchase!" });
          
          // Redirect to orders page after 3 seconds
          setTimeout(() => {
            navigate("/my-orders");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(response.error || response.message || "Payment verification failed");
          toast({ title: "Payment verification failed", description: response.error, variant: "destructive" });
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "An error occurred while verifying payment");
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-lg text-center py-20">
          {loading && (
            <>
              <Loader className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">Verifying Payment</h1>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">Payment Verified!</h1>
              <p className="text-muted-foreground mb-2">{message}</p>
              {orderId && (
                <p className="text-sm text-muted-foreground mb-8">
                  Order ID: <span className="font-semibold text-foreground">{orderId.slice(0, 8)}</span>
                </p>
              )}
              <p className="text-sm text-muted-foreground">Redirecting to your orders...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">Verification Failed</h1>
              <p className="text-muted-foreground mb-8">{message}</p>
              <button
                onClick={() => navigate("/my-orders")}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-medium text-sm tracking-wide hover:bg-primary/90 transition-colors"
              >
                Go to Orders
              </button>
            </>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default VerifyPayment;
