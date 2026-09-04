import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Check, CreditCard, Image as ImageIcon, Loader2, Package, Pencil, Plus, Trash2, Upload, X } from "lucide-react";

interface Variant {
  _id: string;
  color: string;
  storage: string;
  mrp: number;
  price: number;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  variants: Variant[];
}

interface EMIPlan {
  _id: string;
  productId: string;
  tenureMonths: number;
  monthlyAmount: number;
  interestRate: number;
  cashback: number;
  isActive: boolean;
}

interface ProductVariantForm {
  color: string;
  storage: string;
  mrp: string;
  price: string;
  image: string;
}

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  variants: ProductVariantForm[];
}

interface EmiForm {
  productId: string;
  tenureMonths: string;
  monthlyAmount: string;
  interestRate: string;
  cashback: string;
}

const emptyVariant = (): ProductVariantForm => ({
  color: "",
  storage: "",
  mrp: "",
  price: "",
  image: "",
});

const emptyProductForm = (): ProductForm => ({
  name: "",
  slug: "",
  description: "",
  variants: [emptyVariant()],
});

const emptyEmiForm = (): EmiForm => ({
  productId: "",
  tenureMonths: "",
  monthlyAmount: "",
  interestRate: "",
  cashback: "",
});

function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<
    Record<number, boolean>
  >({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState<ProductForm>(
    emptyProductForm()
  );
  const [emiForm, setEmiForm] = useState<EmiForm>(emptyEmiForm());

  const apiUrl = import.meta.env.VITE_API_URL as string;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
    | string
    | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
    | string
    | undefined;

  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const activeImageUploads = Object.values(uploadingImages).some(Boolean);

  const showError = (message: string) => {
    setSuccess("");
    setError(message);
  };

  const showSuccess = (message: string) => {
    setError("");
    setSuccess(message);
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || fallback;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  };

  /* --------------------------------
     FETCH PRODUCTS
  -------------------------------- */

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${apiUrl}/products`);

      setProducts(response.data.products ?? []);
    } catch (error) {
      console.error(error);
      showError(getErrorMessage(error, "Unable to fetch products."));
    } finally {
      setLoading(false);
    }
  };

  const fetchEmiPlans = async (productId: string) => {
    try {
      const response = await axios.get(
        `${apiUrl}/emi-plans/product/${productId}`
      );

      return (response.data.plans ?? []) as EMIPlan[];
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        return [];
      }

      console.error(error);
      return [];
    }
  };

  const loadEmiPlans = async () => {
    if (products.length === 0) {
      setEmiPlans([]);
      return;
    }

    const results = await Promise.all(
      products.map((product) => fetchEmiPlans(product._id))
    );

    setEmiPlans(results.flat());
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      setEmiPlans([]);
      return;
    }

    void loadEmiPlans();
  }, [products]);

  const resetProductForm = () => {
    setProductForm(emptyProductForm());
    setUploadingImages({});
  };

  const closeProductModal = () => {
    if (activeImageUploads) return;

    setShowProductModal(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    resetProductForm();
    setShowProductModal(true);
    setError("");
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      variants: product.variants.map((variant) => ({
        color: variant.color,
        storage: variant.storage,
        mrp: String(variant.mrp),
        price: String(variant.price),
        image: variant.image,
      })),
    });

    setUploadingImages({});
    setShowProductModal(true);
    setError("");
  };

  const handleProductChange = (
    field: keyof Omit<ProductForm, "variants">,
    value: string
  ) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariantForm,
    value: string
  ) => {
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      ),
    }));
  };

  const addVariant = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant()],
    }));
  };

  const removeVariant = (index: number) => {
    if (productForm.variants.length === 1) {
      showError("A product must have at least one variant.");
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  const uploadImageToCloudinary = async (
    file: File,
    variantIndex: number
  ) => {
    if (!cloudName || !uploadPreset) {
      showError(
        "Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to the frontend environment."
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showError("Image size must be 5MB or less.");
      return;
    }

    try {
      setUploadingImages((prev) => ({
        ...prev,
        [variantIndex]: true,
      }));

      setError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Unable to upload image."
        );
      }

      if (!data.secure_url) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      handleVariantChange(variantIndex, "image", data.secure_url);
      showSuccess("Image uploaded successfully.");
    } catch (error) {
      console.error(error);
      showError(
        error instanceof Error
          ? error.message
          : "Unable to upload image."
      );
    } finally {
      setUploadingImages((prev) => ({
        ...prev,
        [variantIndex]: false,
      }));
    }
  };

  const handleImageChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Allows selecting the same file again later.
    event.target.value = "";

    if (!file) return;

    void uploadImageToCloudinary(file, index);
  };

  const validateProductForm = () => {
    if (!productForm.name.trim()) {
      return "Product name is required.";
    }

    if (!productForm.slug.trim()) {
      return "Product slug is required.";
    }

    if (!productForm.description.trim()) {
      return "Product description is required.";
    }

    if (productForm.variants.length === 0) {
      return "Add at least one product variant.";
    }

    for (let index = 0; index < productForm.variants.length; index += 1) {
      const variant = productForm.variants[index];

      if (!variant.color.trim()) {
        return `Color is required for variant ${index + 1}.`;
      }

      if (!variant.storage.trim()) {
        return `Storage is required for variant ${index + 1}.`;
      }

      const mrp = Number(variant.mrp);
      const price = Number(variant.price);

      if (!Number.isFinite(mrp) || mrp <= 0) {
        return `Enter a valid MRP for variant ${index + 1}.`;
      }

      if (!Number.isFinite(price) || price <= 0) {
        return `Enter a valid selling price for variant ${index + 1}.`;
      }

      if (price > mrp) {
        return `Selling price cannot be greater than MRP for variant ${
          index + 1
        }.`;
      }

      if (!variant.image.trim()) {
        return `Upload an image for variant ${index + 1}.`;
      }
    }

    return "";
  };

  const handleProductSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationError = validateProductForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    if (activeImageUploads) {
      showError("Please wait for all image uploads to finish.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const payload = {
        name: productForm.name.trim(),
        slug: productForm.slug.trim().toLowerCase(),
        description: productForm.description.trim(),
        variants: productForm.variants.map((variant) => ({
          color: variant.color.trim(),
          storage: variant.storage.trim(),
          mrp: Number(variant.mrp),
          price: Number(variant.price),
          image: variant.image.trim(),
        })),
      };

      if (editingProduct) {
        await axios.put(
          `${apiUrl}/admin/products/${editingProduct._id}`,
          payload,
          { headers }
        );

        showSuccess("Product updated successfully.");
      } else {
        await axios.post(`${apiUrl}/admin/products`, payload, {
          headers,
        });

        showSuccess("Product created successfully.");
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();

      await fetchProducts();
    } catch (error) {
      console.error(error);
      showError(getErrorMessage(error, "Unable to save product."));
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
    setError("");
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;

    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      setActionLoading(true);
      setError("");

      await axios.delete(
        `${apiUrl}/admin/products/${deletingProduct._id}`,
        { headers }
      );

      showSuccess("Product deleted successfully.");

      setShowDeleteModal(false);
      setDeletingProduct(null);

      await fetchProducts();
    } catch (error) {
      console.error(error);
      showError(getErrorMessage(error, "Unable to delete product."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmiChange = (
    field: keyof EmiForm,
    value: string
  ) => {
    setEmiForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openEmiModal = () => {
    if (products.length === 0) {
      showError("Create a product before adding an EMI plan.");
      return;
    }

    setEmiForm(emptyEmiForm());
    setShowEmiModal(true);
    setError("");
  };

  const closeEmiModal = () => {
    if (actionLoading) return;

    setShowEmiModal(false);
    setEmiForm(emptyEmiForm());
  };

  const validateEmiForm = () => {
    if (!emiForm.productId) {
      return "Please select a product.";
    }

    const tenure = Number(emiForm.tenureMonths);
    const monthlyAmount = Number(emiForm.monthlyAmount);
    const interestRate = Number(emiForm.interestRate);
    const cashback = Number(emiForm.cashback || 0);

    if (!Number.isInteger(tenure) || tenure <= 0) {
      return "Enter a valid tenure.";
    }

    if (!Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
      return "Enter a valid monthly amount.";
    }

    if (!Number.isFinite(interestRate) || interestRate < 0) {
      return "Enter a valid interest rate.";
    }

    if (!Number.isFinite(cashback) || cashback < 0) {
      return "Enter a valid cashback amount.";
    }

    return "";
  };

  const handleCreateEmi = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationError = validateEmiForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const payload = {
        productId: emiForm.productId,
        tenureMonths: Number(emiForm.tenureMonths),
        monthlyAmount: Number(emiForm.monthlyAmount),
        interestRate: Number(emiForm.interestRate),
        cashback: Number(emiForm.cashback || 0),
      };

      const response = await axios.post(
        `${apiUrl}/admin/emi-plans`,
        payload,
        { headers }
      );

      showSuccess("EMI plan created successfully.");
      setShowEmiModal(false);
      setEmiForm(emptyEmiForm());

      const createdPlan = response.data?.plan as EMIPlan | undefined;

      if (createdPlan) {
        setEmiPlans((prev) => [...prev, createdPlan]);
      } else {
        await loadEmiPlans();
      }
    } catch (error) {
      console.error(error);
      showError(getErrorMessage(error, "Unable to create EMI plan."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEmi = async (plan: EMIPlan) => {
    try {
      setActionLoading(true);
      setError("");

      await axios.patch(
        `${apiUrl}/admin/emi-plans/${plan._id}/toggle`,
        {},
        { headers }
      );

      setEmiPlans((prev) =>
        prev.map((currentPlan) =>
          currentPlan._id === plan._id
            ? {
                ...currentPlan,
                isActive: !currentPlan.isActive,
              }
            : currentPlan
        )
      );

      showSuccess(
        `EMI plan ${
          plan.isActive ? "deactivated" : "activated"
        } successfully.`
      );
    } catch (error) {
      console.error(error);
      showError(getErrorMessage(error, "Unable to update EMI plan."));
    } finally {
      setActionLoading(false);
    }
  };


  const totalVariants = products.reduce(
    (total, product) => total + product.variants.length,
    0
  );

  const activeEmiPlans = emiPlans.filter(
    (plan) => plan.isActive
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="page-container py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-primary-600">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Manage FundPay
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage products, variants and EMI plans.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openEmiModal}
              className="btn-secondary cursor-pointer"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Add EMI Plan
            </button>

            <button
              type="button"
              onClick={openAddProduct}
              className="btn-primary cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-success-100 bg-success-50 px-4 py-3">
            <p className="text-sm font-medium text-success-700">
              {success}
            </p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="cursor-pointer text-success-700"
              aria-label="Dismiss success message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-danger-100 bg-danger-50 px-4 py-3">
            <p className="text-sm font-medium text-danger-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
              className="cursor-pointer text-danger-600"
              aria-label="Dismiss error message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <Package className="h-5 w-5 text-primary-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Products</p>
                <p className="text-2xl font-bold text-slate-900">
                  {products.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50">
                <CreditCard className="h-5 w-5 text-success-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Active EMI Plans
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {activeEmiPlans}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50">
                <Package className="h-5 w-5 text-warning-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Variants</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalVariants}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Products
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add, update or remove products from FundPay.
            </p>
          </div>

          {loading ? (
            <div className="card flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-4 font-medium text-slate-700">
                No products yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add your first product to get started.
              </p>

              <button
                type="button"
                onClick={openAddProduct}
                className="btn-primary mt-5 cursor-pointer"
              >
                Add your first product
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const variant = product.variants[0];

                const productPlans = emiPlans.filter(
                  (plan) => plan.productId === product._id
                );

                return (
                  <div
                    key={product._id}
                    className="card overflow-hidden"
                  >
                    {/* Product image */}
                    <div className="flex h-48 items-center justify-center bg-slate-50 p-6">
                      {variant?.image ? (
                        <img
                          src={variant.image}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-slate-300" />
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-slate-900">
                            {product.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            /{product.slug}
                          </p>
                        </div>

                        <span className="badge-primary shrink-0">
                          {product.variants.length}{" "}
                          {product.variants.length === 1
                            ? "variant"
                            : "variants"}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-slate-500">
                          Starting from
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          ₹
                          {variant?.price?.toLocaleString("en-IN") ??
                            "—"}
                        </p>
                      </div>

                      {/* EMI plans */}
                      <div className="mt-5 rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">
                            EMI Plans
                          </span>

                          <span className="text-xs font-semibold text-slate-700">
                            {productPlans.length}
                          </span>
                        </div>

                        {productPlans.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {productPlans.map((plan) => (
                              <div
                                key={plan._id}
                                className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                              >
                                <div>
                                  <p className="text-xs font-semibold text-slate-700">
                                    {plan.tenureMonths} months
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    ₹
                                    {plan.monthlyAmount.toLocaleString(
                                      "en-IN"
                                    )}
                                    /month
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleEmi(plan)
                                  }
                                  disabled={actionLoading}
                                  className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                    plan.isActive
                                      ? "bg-success-50 text-success-700 hover:bg-success-100"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  }`}
                                >
                                  {plan.isActive
                                    ? "Active"
                                    : "Inactive"}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {productPlans.length === 0 && (
                          <p className="mt-3 text-xs text-slate-400">
                            No EMI plans added yet.
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openEditProduct(product)
                          }
                          className="btn-secondary flex-1 cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteProduct(product)
                          }
                          className="btn-danger cursor-pointer"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =========================================
          PRODUCT MODAL
      ========================================= */}

      {showProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProductModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add product details, variants and images.
                </p>
              </div>

              <button
                type="button"
                onClick={closeProductModal}
                disabled={activeImageUploads}
                className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close product modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleProductSubmit}
              className="space-y-6 p-5 sm:p-6"
            >
              {/* Product details */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label">Product Name</label>

                  <input
                    className="input"
                    placeholder="iPhone 17"
                    value={productForm.name}
                    onChange={(event) =>
                      handleProductChange(
                        "name",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">Slug</label>

                  <input
                    className="input"
                    placeholder="iphone-17"
                    value={productForm.slug}
                    onChange={(event) =>
                      handleProductChange(
                        "slug",
                        event.target.value
                      )
                    }
                    required
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Used in the product URL.
                  </p>
                </div>
              </div>

              <div>
                <label className="label">Description</label>

                <textarea
                  className="input min-h-28 resize-none"
                  placeholder="Product description..."
                  value={productForm.description}
                  onChange={(event) =>
                    handleProductChange(
                      "description",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              {/* Variants */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Variants
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add color, storage, pricing and an image for
                      each variant.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="shrink-0 cursor-pointer text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    + Add variant
                  </button>
                </div>

                <div className="space-y-4">
                  {productForm.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">
                          Variant {index + 1}
                        </p>

                        {productForm.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="cursor-pointer text-xs font-medium text-danger-600 hover:text-danger-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label">Color</label>
                          <input
                            className="input"
                            placeholder="Black"
                            value={variant.color}
                            onChange={(event) =>
                              handleVariantChange(
                                index,
                                "color",
                                event.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="label">Storage</label>
                          <input
                            className="input"
                            placeholder="256GB"
                            value={variant.storage}
                            onChange={(event) =>
                              handleVariantChange(
                                index,
                                "storage",
                                event.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="label">MRP</label>
                          <input
                            className="input"
                            type="number"
                            min="1"
                            placeholder="89999"
                            value={variant.mrp}
                            onChange={(event) =>
                              handleVariantChange(
                                index,
                                "mrp",
                                event.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div>
                          <label className="label">
                            Selling Price
                          </label>
                          <input
                            className="input"
                            type="number"
                            min="1"
                            placeholder="79999"
                            value={variant.price}
                            onChange={(event) =>
                              handleVariantChange(
                                index,
                                "price",
                                event.target.value
                              )
                            }
                            required
                          />
                        </div>

                        {/* Cloudinary upload */}
                        <div className="sm:col-span-2">
                          <label className="label">
                            Product Image
                          </label>

                          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                            <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              {variant.image ? (
                                <img
                                  src={variant.image}
                                  alt={`${variant.color} ${variant.storage}`}
                                  className="h-full w-full object-contain p-2"
                                />
                              ) : (
                                <ImageIcon className="h-8 w-8 text-slate-300" />
                              )}
                            </div>

                            <div className="flex flex-col justify-center gap-3">
                              <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                {uploadingImages[index] ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-600" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4 text-primary-600" />
                                    {variant.image
                                      ? "Replace image"
                                      : "Upload image"}
                                  </>
                                )}

                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingImages[index]}
                                  onChange={(event) =>
                                    handleImageChange(
                                      index,
                                      event
                                    )
                                  }
                                />
                              </label>

                              <p className="text-xs leading-5 text-slate-400">
                                JPG, PNG or WebP. Maximum size:
                                5MB.
                              </p>

                              {variant.image && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVariantChange(
                                      index,
                                      "image",
                                      ""
                                    )
                                  }
                                  className="self-start cursor-pointer text-xs font-semibold text-danger-600"
                                >
                                  Remove image
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeProductModal}
                  disabled={actionLoading || activeImageUploads}
                  className="btn-secondary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading || activeImageUploads}
                  className="btn-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : activeImageUploads ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading image...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {editingProduct
                        ? "Update Product"
                        : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {showDeleteModal && deletingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50">
              <Trash2 className="h-5 w-5 text-danger-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {deletingProduct.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={actionLoading}
                className="btn-secondary flex-1 cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={actionLoading}
                className="btn-danger flex-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          EMI MODAL
      ========================================= */}

      {showEmiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEmiModal();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add EMI Plan
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create an EMI option for a product.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEmiModal}
                disabled={actionLoading}
                className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close EMI modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateEmi}
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label className="label">Product</label>

                <select
                  className="input cursor-pointer"
                  value={emiForm.productId}
                  onChange={(event) =>
                    handleEmiChange(
                      "productId",
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">Select a product</option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Tenure (months)</label>

                  <input
                    className="input"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="12"
                    value={emiForm.tenureMonths}
                    onChange={(event) =>
                      handleEmiChange(
                        "tenureMonths",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    Monthly Amount
                  </label>

                  <input
                    className="input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="4999"
                    value={emiForm.monthlyAmount}
                    onChange={(event) =>
                      handleEmiChange(
                        "monthlyAmount",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    Interest Rate (%)
                  </label>

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10"
                    value={emiForm.interestRate}
                    onChange={(event) =>
                      handleEmiChange(
                        "interestRate",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">Cashback</label>

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="500"
                    value={emiForm.cashback}
                    onChange={(event) =>
                      handleEmiChange(
                        "cashback",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEmiModal}
                  disabled={actionLoading}
                  className="btn-secondary cursor-pointer disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create EMI Plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
