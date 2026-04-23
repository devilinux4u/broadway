import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { ArrowUpCircle, Plus, Trash2, Save, X, Upload, Image, Edit2, Package, Phone, ShoppingBag, Printer, Search } from "lucide-react";
import { adminContentAPI, adminOrdersAPI } from "@/services/adminAPI";
import {
  createProduct,
  getAllProducts,
  getProductByID,
  updateProduct,
  deleteProduct,
  addStockMovement,
  uploadProductImages,
  deleteProductImage,
  addProductColors,
  type ProductDTO,
  type CreateProductRequest,
  type UpdateProductRequest,
  type StockMovementRequest,
} from "@/services/inventoryAPI";

interface Props {
  products: ProductDTO[];
  onRefresh: () => void;
}

const orderSources = ["social_media", "phone", "app", "walk_in", "other"];

interface CreatedOrder {
  id: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes: string | null;
  created_at: string;
  items: { name: string; quantity: number; price: number }[];
}

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const AdminInventory = ({ products: propProducts, onRefresh }: Props) => {
  const [products, setProducts] = useState<ProductDTO[]>(propProducts);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<"products" | "stock" | "orders" | "invoice" | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const multiImageInputRef = useRef<HTMLInputElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [additionalImages, setAdditionalImages] = useState<{ id?: string; image_url: string }[]>([]);
  const [colors, setColors] = useState<{ name: string; value: string }[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorValue, setNewColorValue] = useState("#E91E63");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Stock form
  const [stockForm, setStockForm] = useState({ product_id: "", type: "in", quantity: "", reason: "" });

  // Product form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", category: "face", price_npr: "", image_url: "", badge: "", in_stock: true, stock_quantity: "0", low_stock_threshold: "5"
  });
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);

  // Manual order form
  const [orderForm, setOrderForm] = useState({
    customer_name: "", phone: "", address: "", city: "", source: "social_media", notes: "", payment_method: "cash", payment_status: "paid"
  });
  const [orderItems, setOrderItems] = useState<{ product_id: string; quantity: number }[]>([]);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  useEffect(() => { 
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await getAllProducts({ limit: 100 });
      if (result.data) setProducts(result.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminContentAPI.getAllContent();
      if (response.sections && Array.isArray(response.sections)) {
        const categoriesSection = response.sections.find((item: any) => item.section === "categories");
        if (categoriesSection && categoriesSection.content?.items && Array.isArray(categoriesSection.content.items)) {
          const categoryNames = categoriesSection.content.items.map((item: any) => item.name.toLowerCase());
          setCategories(categoryNames);
        }
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    }
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), value: newColorValue }]);
    setNewColorName("");
    setNewColorValue("#E91E63");
  };

  const removeColor = (idx: number) => setColors(colors.filter((_, i) => i !== idx));

  // === STOCK FUNCTIONS ===
  const handleStockSubmit = async () => {
    if (!stockForm.product_id || !stockForm.quantity) { toast({ title: "Select product and enter quantity" }); return; }
    const qty = parseInt(stockForm.quantity);
    if (qty <= 0) { toast({ title: "Quantity must be positive" }); return; }
    const product = products.find(p => p.id === stockForm.product_id);
    if (!product) return;
    if (stockForm.type === "out" && qty > product.stock_quantity) {
      toast({ title: "Insufficient stock", description: `Only ${product.stock_quantity} units available`, variant: "destructive" }); return;
    }
    
    try {
      const movementData: StockMovementRequest = {
        product_id: stockForm.product_id,
        type: stockForm.type as "in" | "out",
        quantity: qty,
        reason: stockForm.reason || undefined,
      };
      await addStockMovement(movementData);
      toast({ title: `Stock ${stockForm.type === "in" ? "added" : "removed"} successfully` });
      setStockForm({ product_id: "", type: "in", quantity: "", reason: "" });
      setActiveSection(null);
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // === PRODUCT FUNCTIONS ===
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      console.log("Selected file:", file);
      // Store the actual file for upload
      setMainImageFile(file);
      // Create a preview for the UI
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductForm({ ...productForm, image_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
      toast({ title: "Main image selected" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
    setUploadingImage(false);
  };

  const handleMultiImageUpload = async (files: FileList) => {
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAdditionalImages(prev => [...prev, { image_url: e.target?.result as string }]);
        };
        reader.readAsDataURL(file);
      }
      toast({ title: "Images ready to upload with product" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  };

  const removeAdditionalImage = async (index: number) => {
    const image = additionalImages[index];
    // Only delete from backend if the image has a valid string ID (already saved in database)
    if (typeof image.id === 'string' && image.id.length > 0) {
      try {
        console.log("Deleting image with ID:", image.id);
        await deleteProductImage(image.id);
        toast({ title: "Image deleted" });
      } catch (error: any) {
        console.error("Delete error:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      console.log("Skipping delete - image has no valid ID:", image);
    }
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price_npr) { toast({ title: "Name and price are required" }); return; }
    try {
      console.log("Main image file:", mainImageFile);
      const productData: CreateProductRequest = {
        name: productForm.name,
        description: productForm.description || undefined,
        category: productForm.category,
        price_npr: parseFloat(productForm.price_npr),
        badge: productForm.badge || undefined,
        in_stock: productForm.in_stock,
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        low_stock_threshold: parseInt(productForm.low_stock_threshold) || 5,
      };

      const newProduct = await createProduct(productData, mainImageFile || undefined);

      // Upload additional images if any
      if (additionalImages.length > 0) {
        const files = new DataTransfer();
        for (const img of additionalImages) {
          if (typeof img.image_url === 'string' && img.image_url.startsWith('data:')) {
            // Convert data URL to blob and file
            const response = await fetch(img.image_url);
            const blob = await response.blob();
            const file = new File([blob], 'image.png', { type: blob.type });
            files.items.add(file);
          }
        }
        if (files.items.length > 0) {
          try {
            await uploadProductImages(newProduct.id, files.files);
          } catch (err) {
            console.error('Failed to upload additional images:', err);
          }
        }
      }

      // Add colors if any
      if (colors.length > 0) {
        try {
          await addProductColors(newProduct.id, colors);
        } catch (err) {
          console.error('Failed to add colors:', err);
        }
      }

      toast({ title: "Product added!" });
      resetProductForm();
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingId || !productForm.name || !productForm.price_npr) return;
    try {
      const updateData: UpdateProductRequest = {
        name: productForm.name,
        description: productForm.description || undefined,
        category: productForm.category,
        price_npr: parseFloat(productForm.price_npr),
        badge: productForm.badge || undefined,
        in_stock: productForm.in_stock,
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        low_stock_threshold: parseInt(productForm.low_stock_threshold) || 5,
      };

      await updateProduct(editingId, updateData, mainImageFile || undefined);

      // Upload new additional images if any
      const newImages = additionalImages.filter(img => !img.id);
      if (newImages.length > 0) {
        const files = new DataTransfer();
        for (const img of newImages) {
          if (typeof img.image_url === 'string' && img.image_url.startsWith('data:')) {
            const response = await fetch(img.image_url);
            const blob = await response.blob();
            const file = new File([blob], 'image.png', { type: blob.type });
            files.items.add(file);
          }
        }
        if (files.items.length > 0) {
          try {
            await uploadProductImages(editingId, files.files);
          } catch (err) {
            console.error('Failed to upload additional images:', err);
          }
        }
      }

      // Update colors
      if (colors.length > 0) {
        try {
          await addProductColors(editingId, colors);
        } catch (err) {
          console.error('Failed to update colors:', err);
        }
      }

      toast({ title: "Product updated!" });
      resetProductForm();
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      toast({ title: "Product deleted" });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const startEditProduct = async (p: ProductDTO) => {
    setEditingId(p.id);
    setActiveSection("products");
    setProductForm({
      name: p.name, description: p.description || "", category: p.category,
      price_npr: p.price_npr.toString(), image_url: p.image_url || "",
      badge: p.badge || "", in_stock: p.in_stock,
      stock_quantity: p.stock_quantity.toString(), low_stock_threshold: p.low_stock_threshold.toString(),
    });
    setMainImageFile(null);
    // Load additional images and colors from the product detail
    try {
      const productDetail = await getProductByID(p.id);
      setAdditionalImages(productDetail.images?.map(i => ({ id: i.id, image_url: i.image_url })) || []);
      setColors(productDetail.colors || []);
    } catch (error) {
      console.error("Failed to load product details:", error);
      setAdditionalImages([]);
      setColors([]);
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: "", description: "", category: "face", price_npr: "", image_url: "", badge: "", in_stock: true, stock_quantity: "0", low_stock_threshold: "5" });
    setMainImageFile(null);
    setActiveSection(null);
    setEditingId(null);
    setAdditionalImages([]);
    setColors([]);
    setNewColorName("");
    setNewColorValue("#E91E63");
  };

  // === MANUAL ORDER ===
  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: 1 }]);
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getOrderTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + (product ? product.price_npr * item.quantity : 0);
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!orderForm.customer_name || !orderForm.phone || !orderForm.city) {
      toast({ title: "Customer name, phone, and city are required" }); return;
    }
    if (orderItems.length === 0 || orderItems.some(i => !i.product_id || i.quantity <= 0)) {
      toast({ title: "Add at least one valid item" }); return;
    }

    // Check stock
    for (const item of orderItems) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) { toast({ title: "Product not found", variant: "destructive" }); return; }
      if (item.quantity > product.stock_quantity) {
        toast({ title: `Insufficient stock for ${product.name}`, variant: "destructive" }); return;
      }
    }

    const total = getOrderTotal();
    const sourceLabel = orderSources.find(s => s === orderForm.source)?.replace("_", " ") || orderForm.source;

    try {
      const orderItemsPayload = orderItems.map(item => {
        const product = products.find(p => p.id === item.product_id)!;
        return {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url || "",
          quantity: item.quantity,
          price: product.price_npr,
        };
      });

      const orderResponse = await adminOrdersAPI.createOrder({
        shipping_name: orderForm.customer_name,
        shipping_phone: orderForm.phone,
        shipping_address: orderForm.address || "N/A",
        shipping_city: orderForm.city,
        payment_method: orderForm.payment_method,
        notes: `[${sourceLabel}] ${orderForm.notes || ""}`.trim(),
        order_items: orderItemsPayload,
      });

      const order = orderResponse?.data;
      if (!order?.id) {
        throw new Error("Failed to create order");
      }

      const createdItems = orderItems.map(item => {
        const product = products.find(p => p.id === item.product_id)!;
        return { name: product.name, quantity: item.quantity, price: product.price_npr };
      });

      toast({ title: "Order created successfully!", description: `Total: Rs. ${total.toLocaleString()}` });
      setCreatedOrder({
        id: order.id,
        shipping_name: orderForm.customer_name,
        shipping_phone: orderForm.phone,
        shipping_address: orderForm.address || "N/A",
        shipping_city: orderForm.city,
        total_amount: total,
        payment_method: orderForm.payment_method,
        payment_status: orderForm.payment_status,
        status: order.status || "confirmed",
        notes: `[${sourceLabel}] ${orderForm.notes || ""}`.trim(),
        created_at: order.created_at || new Date().toISOString(),
        items: createdItems,
      });
      setOrderForm({ customer_name: "", phone: "", address: "", city: "", source: "social_media", notes: "", payment_method: "cash", payment_status: "paid" });
      setOrderItems([]);
      setActiveSection("invoice");
      await loadProducts();
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error creating order", description: error?.message || "Failed to create order", variant: "destructive" });
    }
  };

  const updateOrderStatus = async (status: string) => {
    if (!createdOrder) return;
    try {
      await adminOrdersAPI.updateOrderStatus(createdOrder.id, status);
      setCreatedOrder({ ...createdOrder, status });
      toast({ title: `Order status updated to ${status}` });
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to update status", variant: "destructive" });
    }
  };

  const printInvoice = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Invoice #${createdOrder?.id.slice(0, 8)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; margin: 0; }
        .header p { color: #666; margin: 4px 0; }
        .details { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .details div { font-size: 13px; }
        .details strong { display: block; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 600; }
        .total { text-align: right; font-size: 18px; font-weight: bold; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #e8f5e9; color: #2e7d32; }
        .footer { text-align: center; margin-top: 40px; color: #999; font-size: 11px; }
      </style></head><body>
      ${content.innerHTML}
      <div class="footer">Thank you for your order!</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedSearch) ||
          p.category.toLowerCase().includes(normalizedSearch) ||
          (p.badge || "").toLowerCase().includes(normalizedSearch)
      )
    : products;
  const groupedProducts = filteredProducts.reduce<Record<string, ProductDTO[]>>((acc, product) => {
    const categoryName = product.category || "uncategorized";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(product);
    return acc;
  }, {});
  const sortedCategoryEntries = Object.entries(groupedProducts).sort(([a], [b]) => a.localeCompare(b));

  const runProductSearch = () => {
    setSearchQuery(searchInput);
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-sm p-4">
          <h3 className="text-sm font-semibold text-destructive mb-2">⚠️ Low Stock Alerts ({lowStockProducts.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-6 h-6 rounded-sm object-cover" />}
                <span className="text-foreground">{p.name}</span>
                <span className="text-destructive font-medium ml-auto">{p.stock_quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Cards */}
      <h2 className="font-display text-xl font-bold text-foreground">Inventory Management</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button onClick={() => { resetProductForm(); setActiveSection(activeSection === "products" ? null : "products"); }}
          className={`flex flex-col items-center gap-2 p-4 rounded-sm border text-sm font-medium transition-colors ${activeSection === "products" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-secondary"}`}>
          <Plus size={20} />
          <span>Add Product</span>
        </button>
        <button onClick={() => { setActiveSection(activeSection === "stock" ? null : "stock"); }}
          className={`flex flex-col items-center gap-2 p-4 rounded-sm border text-sm font-medium transition-colors ${activeSection === "stock" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-secondary"}`}>
          <ArrowUpCircle size={20} />
          <span>Stock In/Out</span>
        </button>
        <button onClick={() => { setOrderItems([{ product_id: "", quantity: 1 }]); setActiveSection(activeSection === "orders" ? null : "orders"); }}
          className={`flex flex-col items-center gap-2 p-4 rounded-sm border text-sm font-medium transition-colors ${activeSection === "orders" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-secondary"}`}>
          <Phone size={20} />
          <span>Manual Order</span>
          <span className="text-[10px] text-muted-foreground font-normal">Social / Phone / App</span>
        </button>
      </div>

      {/* Stock In/Out Form */}
      {activeSection === "stock" && (
        <div className="bg-secondary p-5 rounded-sm space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Stock In / Out</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={stockForm.product_id} onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock_quantity} in stock)</option>)}
            </select>
            <select value={stockForm.type} onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm">
              <option value="in">Stock In (+)</option>
              <option value="out">Stock Out (-)</option>
            </select>
            <input placeholder="Quantity *" type="number" min="1" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <input placeholder="Reason (optional)" value={stockForm.reason} onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleStockSubmit} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90">Submit</button>
            <button onClick={() => setActiveSection(null)} className="px-6 py-2 border border-input text-foreground text-sm rounded-sm hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Form */}
      {activeSection === "products" && (
        <div className="bg-secondary p-6 rounded-sm space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">{editingId ? "Edit Product" : "New Product"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Product Name *" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <input placeholder="Price (NPR) *" type="number" value={productForm.price_npr} onChange={(e) => setProductForm({ ...productForm, price_npr: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm">
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <input placeholder="Badge (optional)" value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <input placeholder="Stock Quantity" type="number" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <input placeholder="Low Stock Threshold" type="number" value={productForm.low_stock_threshold} onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <div className="col-span-full space-y-3">
              <p className="text-sm font-medium text-foreground">Main Image</p>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="flex items-center gap-2 px-4 py-3 border border-dashed border-input rounded-sm bg-background text-muted-foreground text-sm hover:border-primary hover:text-foreground transition-colors disabled:opacity-50">
                  {uploadingImage ? <>Uploading...</> : <><Upload size={16} /> Upload Main Image</>}
                </button>
                {productForm.image_url && (
                  <div className="flex items-center gap-2">
                    <img src={productForm.image_url} alt="Preview" className="w-10 h-10 object-cover rounded-sm" />
                    <span className="text-xs text-primary flex items-center gap-1"><Image size={12} /> Main</span>
                  </div>
                )}
              </div>

              <p className="text-sm font-medium text-foreground">Additional Images</p>
              <input ref={multiImageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleMultiImageUpload(e.target.files); }} />
              <div className="flex items-center gap-3 flex-wrap">
                <button type="button" onClick={() => multiImageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 border border-dashed border-input rounded-sm bg-background text-muted-foreground text-sm hover:border-primary hover:text-foreground transition-colors">
                  <Upload size={16} /> Add More Images
                </button>
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="relative group/img">
                    <img src={img.image_url} alt={`Extra ${idx + 1}`} className="w-12 h-12 object-cover rounded-sm border border-border" />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <input placeholder="Description (optional)" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="col-span-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <label className="col-span-full flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={productForm.in_stock} onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })} className="rounded" /> In Stock
            </label>
            {/* Color Management */}
            <div className="col-span-full space-y-3">
              <p className="text-sm font-medium text-foreground">Product Colors</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {colors.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-background border border-border rounded-sm px-3 py-1.5">
                    <span className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: c.value }} />
                    <span className="text-sm text-foreground">{c.name}</span>
                    <button type="button" onClick={() => removeColor(idx)} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                  </div>
                ))}
                {colors.length === 0 && <span className="text-xs text-muted-foreground">No colors added (default colors will be shown)</span>}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={newColorValue} onChange={(e) => setNewColorValue(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <input placeholder="Color name (e.g. Rose)" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} className="px-3 py-2 border border-input rounded-sm bg-background text-foreground text-sm flex-1" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }} />
                <button type="button" onClick={addColor} className="flex items-center gap-1 px-3 py-2 bg-secondary text-foreground text-sm rounded-sm hover:bg-muted transition-colors border border-border">
                  <Plus size={14} /> Add Color
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={editingId ? handleUpdateProduct : handleAddProduct} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90">
              <Save size={14} /> {editingId ? "Update" : "Save"}
            </button>
            <button onClick={resetProductForm} className="flex items-center gap-2 px-6 py-2 border border-input text-foreground text-sm rounded-sm hover:bg-secondary">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manual Order Form */}
      {activeSection === "orders" && (
        <div className="bg-secondary p-6 rounded-sm space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Phone size={18} /> Create Manual Order
          </h3>
          <p className="text-xs text-muted-foreground">For orders from social media, phone calls, walk-ins, or other apps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Customer Name *" value={orderForm.customer_name} onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <input placeholder="Phone *" value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <input placeholder="Address" value={orderForm.address} onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <input placeholder="City *" value={orderForm.city} onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
            <select value={orderForm.source} onChange={(e) => setOrderForm({ ...orderForm, source: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm">
              {orderSources.map(s => <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
            <select value={orderForm.payment_method} onChange={(e) => setOrderForm({ ...orderForm, payment_method: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm">
              <option value="cash">Cash</option>
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cod">Cash on Delivery</option>
            </select>
            <select value={orderForm.payment_status} onChange={(e) => setOrderForm({ ...orderForm, payment_status: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm">
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <input placeholder="Notes (optional)" value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} className="px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm" />
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Order Items</p>
              <button onClick={addOrderItem} className="flex items-center gap-1 text-xs text-primary hover:underline"><Plus size={12} /> Add Item</button>
            </div>
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select value={item.product_id} onChange={(e) => updateOrderItem(idx, "product_id", e.target.value)} className="flex-1 px-3 py-2 border border-input rounded-sm bg-background text-foreground text-sm">
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Rs.{p.price_npr}) — {p.stock_quantity} left</option>)}
                </select>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateOrderItem(idx, "quantity", parseInt(e.target.value) || 1)} className="w-20 px-3 py-2 border border-input rounded-sm bg-background text-foreground text-sm" />
                <button onClick={() => removeOrderItem(idx)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            ))}
            {orderItems.length > 0 && (
              <p className="text-sm font-semibold text-foreground text-right">Total: Rs. {getOrderTotal().toLocaleString()}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreateOrder} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90">
              <ShoppingBag size={14} /> Create Order
            </button>
            <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 px-6 py-2 border border-input text-foreground text-sm rounded-sm hover:bg-secondary">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoice View */}
      {activeSection === "invoice" && createdOrder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">🧾 Invoice Created</h3>
            <div className="flex items-center gap-2">
              <button onClick={printInvoice} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90">
                <Printer size={14} /> Print Invoice
              </button>
              <button onClick={() => { setCreatedOrder(null); setActiveSection(null); }} className="px-4 py-2 border border-input text-foreground text-sm rounded-sm hover:bg-secondary">
                Close
              </button>
            </div>
          </div>

          {/* Order Status */}
          <div className="flex items-center gap-4 bg-secondary/50 border border-border rounded-sm p-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Order Status</label>
              <select value={createdOrder.status} onChange={(e) => updateOrderStatus(e.target.value)} className="px-3 py-2 border border-input rounded-sm bg-background text-foreground text-sm">
                {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Payment</label>
              <span className={`text-xs font-medium px-2 py-1 rounded-sm ${createdOrder.payment_status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
                {createdOrder.payment_status.toUpperCase()}
              </span>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Inventory</label>
              <span className="text-xs font-medium px-2 py-1 rounded-sm bg-primary/10 text-primary">✓ Updated</span>
            </div>
          </div>

          {/* Printable Invoice */}
          <div ref={invoiceRef} className="bg-card border border-border rounded-sm p-8">
            <div className="header text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">INVOICE</h1>
              <p className="text-sm text-muted-foreground">#{createdOrder.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">{new Date(createdOrder.created_at).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">BILL TO</p>
                <p className="text-foreground font-medium">{createdOrder.shipping_name}</p>
                <p className="text-muted-foreground">{createdOrder.shipping_phone}</p>
                <p className="text-muted-foreground">{createdOrder.shipping_address}</p>
                <p className="text-muted-foreground">{createdOrder.shipping_city}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground mb-1">DETAILS</p>
                <p className="text-foreground">Payment: {createdOrder.payment_method.toUpperCase()}</p>
                <p className="text-muted-foreground">Status: {createdOrder.payment_status.toUpperCase()}</p>
                {createdOrder.notes && <p className="text-muted-foreground text-xs mt-1">{createdOrder.notes}</p>}
              </div>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 font-medium text-foreground">Item</th>
                  <th className="text-center py-2 font-medium text-foreground">Qty</th>
                  <th className="text-right py-2 font-medium text-foreground">Price</th>
                  <th className="text-right py-2 font-medium text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {createdOrder.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-3 text-foreground">{item.name}</td>
                    <td className="py-3 text-center text-muted-foreground">{item.quantity}</td>
                    <td className="py-3 text-right text-muted-foreground">Rs. {item.price.toLocaleString()}</td>
                    <td className="py-3 text-right text-foreground font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right border-t-2 border-foreground pt-3">
              <p className="text-xl font-bold text-foreground">Total: Rs. {createdOrder.total_amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2"><Package size={18} /> Products ({filteredProducts.length})</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              placeholder="Search product, badge, or category"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runProductSearch();
                }
              }}
              className="w-full sm:w-72 px-4 py-2.5 border border-input rounded-sm bg-background text-foreground text-sm"
            />
            <button
              onClick={runProductSearch}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90"
            >
              <Search size={14} /> Search
            </button>
          </div>
        </div>

        {sortedCategoryEntries.map(([categoryName, categoryProducts]) => (
          <div key={categoryName} className="bg-card rounded-sm border border-border overflow-hidden mb-4">
            <div className="px-4 py-3 bg-secondary border-b border-border flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground capitalize">{categoryName}</h4>
              <span className="text-xs text-muted-foreground">{categoryProducts.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-foreground">Price</th>
                    <th className="text-left p-4 font-medium text-foreground">Stock</th>
                    <th className="text-left p-4 font-medium text-foreground">Badge</th>
                    <th className="text-right p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryProducts.map((p) => (
                    <tr key={p.id} className={`border-t border-border ${p.stock_quantity <= p.low_stock_threshold ? 'bg-destructive/5' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-sm" />}
                          <span className="text-foreground font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">Rs. {p.price_npr.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium ${p.stock_quantity <= p.low_stock_threshold ? 'text-destructive' : 'text-primary'}`}>
                          {p.stock_quantity} units
                        </span>
                        {p.stock_quantity <= p.low_stock_threshold && <span className="ml-2 text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">LOW</span>}
                      </td>
                      <td className="p-4">{p.badge && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-sm">{p.badge}</span>}</td>
                      <td className="p-4 text-right flex justify-end gap-1">
                        <button onClick={() => startEditProduct(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="bg-card rounded-sm border border-border p-8 text-center text-muted-foreground">
            No products found.
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminInventory;
