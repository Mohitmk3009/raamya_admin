// 'use client';
// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// const ProductForm = ({ onSubmit, initialProduct = null, isUpdate = false }) => {
//     console.log("ProductForm received this 'initialProduct' prop:", initialProduct);
//     const [formData, setFormData] = useState({
//         // Corrected state keys to match backend schema
//         name: '',
//         description: '',
//         category: 'IT girl',
//         price: '',
//         variants: [{ size: 'S', stock: '' }],
//         images: [],
//         isNewArrival: false,
//         isMostWanted: false,
//         isSuggested: false,
//         suggestedItems: [],
//         companyId: '',
//     });

//     const [newImageFiles, setNewImageFiles] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [allProducts, setAllProducts] = useState([]);
//     const [initialLoading, setInitialLoading] = useState(true);

//     useEffect(() => {
//         const fetchAllProducts = async () => {
//             try {
//                 const response = await fetch(`${API_BASE_URL}/products`);
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch all products.');
//                 }
//                 const data = await response.json();
//                 // console.log('Fetched products for suggestions:', data.products);
//                 setAllProducts(data.products);
//                 setInitialLoading(false);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//                 setInitialLoading(false);
//             }
//         };
//         fetchAllProducts();
//     }, []);


//     useEffect(() => {
//         if (initialProduct) {
//             // Use the functional update form to merge with the previous state
//             setFormData(prevFormData => ({
//                 ...prevFormData, // <-- This is the key change!
//                 name: initialProduct.name || '',
//                 price: initialProduct.price ? String(initialProduct.price) : '',
//                 companyId: initialProduct.companyId || '',
//                 description: initialProduct.description || '',
//                 category: initialProduct.category || 'IT girl',
//                 variants: initialProduct.variants?.length > 0
//                     ? initialProduct.variants.map(v => ({
//                         size: v.size || 'S',
//                         stock: v.stock?.toString() || '0',
//                         sku: v.sku || '' // preserve sku
//                     }))
//                     : [{ size: 'S', stock: '', sku: '' }],
//                 images: initialProduct.images?.length > 0 ? initialProduct.images : [],
//                 isNewArrival: !!initialProduct.isNewArrival,
//                 isMostWanted: !!initialProduct.isMostWanted,
//                 isSuggested: !!initialProduct.isSuggested,
//                 suggestedItems: initialProduct.suggestedItems?.map(i => i._id || i) || [],
//             }));
//         }
//     }, [initialProduct]);

//     // console.log("Form Data State:", formData);

//     const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

//     const handleVariantChange = (index, e) => {
//         const newVariants = [...formData.variants];
//         newVariants[index][e.target.name] = e.target.value;
//         setFormData(prev => ({ ...prev, variants: newVariants }));
//     };
//     const addVariant = () => setFormData(prev => ({ ...prev, variants: [...prev.variants, { size: 'M', stock: '' }] }));
//     const removeVariant = (index) => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

//     const handleImageChange = (index, e) => {
//         const newImages = [...formData.images];
//         newImages[index] = e.target.value;
//         setFormData(prev => ({ ...prev, images: newImages }));
//     };
//     const addImageField = () => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));

//     const removeImageField = (index) => {
//         const newImages = formData.images.filter((_, i) => i !== index);
//         setFormData(prev => ({ ...prev, images: newImages.length > 0 ? newImages : [''] }));
//     };
//     const handleImageUpload = (e) => {
//         if (e.target.files) {
//             setNewImageFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
//         }
//     };
//     const removeNewImageFile = (index) => {
//         setNewImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
//     };
//     const handleSuggestedItemToggle = (productId) => {
//         setFormData(prev => {
//             const newSuggestedItems = prev.suggestedItems.includes(productId)
//                 ? prev.suggestedItems.filter(id => id !== productId) // Uncheck: Remove the ID
//                 : [...prev.suggestedItems, productId];              // Check: Add the ID
//             return { ...prev, suggestedItems: newSuggestedItems };
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const productData = new FormData();

//         // 1. Append all text, number, and boolean fields
//         productData.append('companyId', formData.companyId);
//         productData.append('name', formData.name);
//         productData.append('description', formData.description);
//         productData.append('category', formData.category);
//         productData.append('price', formData.price);
//         productData.append('isNewArrival', formData.isNewArrival);
//         productData.append('isMostWanted', formData.isMostWanted);
//         productData.append('isSuggested', formData.isSuggested);

//         // 2. Stringify complex array data before appending
//         productData.append('variants', JSON.stringify(formData.variants));
//         productData.append('suggestedItems', JSON.stringify(formData.suggestedItems));
        
//         // 3. Append existing image URLs (for updates)
//         formData.images.forEach(imageUrl => {
//             productData.append('existingImages', imageUrl);
//         });

//         // 4. Append new image files for upload
//         newImageFiles.forEach(file => {
//             productData.append('images', file); // Field name 'images' must match backend middleware
//         });

//         // console.log("Submitting payload for update:", dataToSubmit); // Good for debugging
//         try {
//             await onSubmit(dataToSubmit);
//         } catch (error) {
//             alert(error.message);
//         } finally {
//             setLoading(false);
//         }
//     };





//     if (initialLoading) {
//         return <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">Loading product data...</div>;
//     }

//     return (
//         <div className="bg-[#121212] min-h-screen text-white p-6 md:p-10 font-sans">
//             <header className="mb-6">
//                 <h1 className="text-xl md:text-2xl font-bold">{isUpdate ? 'Edit Product' : 'Add New Product'}</h1>
//                 <p className="text-gray-400 text-sm">Home &gt; All Products &gt; {isUpdate ? 'Edit Product' : 'Add New Product'}</p>
//             </header>

//             <form onSubmit={handleSubmit}>
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     <div className="lg:col-span-2 space-y-4 bg-[#1C1C1C] p-6 rounded-lg border border-[#3A3A3A]">
//                         <div>
//                             <label htmlFor="companyId" className="block text-sm font-medium text-gray-400">Company ID</label>
//                             <input type="text" id="companyId" name="companyId" value={formData.companyId} onChange={handleChange} required className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none" />
//                         </div>
//                         <div>
//                             <label htmlFor="name" className="block text-sm font-medium text-gray-400">Product Name</label>
//                             <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none" />
//                         </div>
//                         <div>
//                             <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
//                             <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none"></textarea>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label htmlFor="price" className="block text-sm font-medium text-gray-400">Regular Price</label>
//                                 <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none" />
//                             </div>
//                             <div>
//                                 <label htmlFor="category" className="block text-sm font-medium text-gray-400">Category</label>
//                                 <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none">
//                                     <option>IT girl</option><option>Girly Pop</option><option>bloom girl</option><option>desi diva</option><option>street chic</option>
//                                 </select>
//                             </div>
//                         </div>
//                         <div className="pt-4">
//                             <h3 className="text-lg font-semibold mb-2">Variants (Size & Stock)</h3>
//                             <p className="text-sm text-gray-500 mb-2">A product is "In Stock" if any variant has a stock quantity greater than 0.</p>
//                             {formData.variants.map((variant, index) => (
//                                 <div key={index} className="flex items-center gap-4 mb-2 p-2 bg-[#2C2C2C] rounded">
//                                     <select name="size" value={variant.size} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-[#3A3A3A] border-2 border-[#5A5A5A] rounded-md p-2">
//                                         <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option>
//                                     </select>
//                                     <input type="number" name="stock" placeholder="Stock Quantity" value={variant.stock} onChange={(e) => handleVariantChange(index, e)} required className="w-full bg-[#3A3A3A] border-2 border-[#5A5A5A] rounded-md p-2" />
//                                     <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-400">Remove</button>
//                                 </div>
//                             ))}
//                             <button type="button" onClick={addVariant} className="text-sm text-yellow-400 hover:text-yellow-300 mt-2">+ Add Size</button>
//                         </div>

//                         {/* Product Flags Section */}
//                         <div className="pt-4">
//                             <h3 className="text-lg font-semibold mb-2">Product Flags</h3>
//                             <div className="flex items-center gap-4 mb-4">
//                                 <div className="flex items-center gap-2">
//                                     <input type="checkbox" id="isNewArrival" name="isNewArrival" checked={formData.isNewArrival} onChange={(e) => setFormData(prev => ({ ...prev, isNewArrival: e.target.checked }))} className="form-checkbox h-5 w-5 text-yellow-400 bg-gray-700 border-gray-600 rounded" />
//                                     <label htmlFor="isNewArrival" className="text-white">Mark as New Arrival</label>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <input type="checkbox" id="isSuggested" name="isSuggested" checked={formData.isSuggested} onChange={(e) => setFormData(prev => ({ ...prev, isSuggested: e.target.checked }))} className="form-checkbox h-5 w-5 text-yellow-400 bg-gray-700 border-gray-600 rounded" />
//                                     <label htmlFor="isSuggested" className="text-white">Mark as a Suggestion</label>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <input type="checkbox" id="isMostWanted" name="isMostWanted" checked={formData.isMostWanted} onChange={(e) => setFormData(prev => ({ ...prev, isMostWanted: e.target.checked }))} className="form-checkbox h-5 w-5 text-yellow-400 bg-gray-700 border-gray-600 rounded" />
//                                     <label htmlFor="isMostWanted">Mark as Most Wanted</label>
//                                 </div>
//                             </div>
//                             {/* Suggested Items Checkbox List */}
//                             <div className="mt-1 max-h-60 w-full overflow-y-auto rounded-md border-2 border-[#3A3A3A] bg-[#2C2C2C] p-2">
//                                 <div className="space-y-2">
//                                     {allProducts.map(product => (
//                                         // Using a label makes the entire row clickable
//                                         <label
//                                             key={product._id}
//                                             className="flex cursor-pointer items-center rounded-md p-2 transition-colors hover:bg-[#3A3A3A]"
//                                         >
//                                             <input
//                                                 type="checkbox"
//                                                 checked={formData.suggestedItems.includes(product._id)}
//                                                 onChange={() => handleSuggestedItemToggle(product._id)}
//                                                 className="form-checkbox mr-3 h-5 w-5 rounded border-gray-600 bg-gray-700 text-yellow-400 focus:ring-yellow-500"
//                                             />
//                                             <span className="text-white">{product.name}</span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="lg:col-span-1 space-y-4 bg-[#1C1C1C] p-6 rounded-lg border border-[#3A3A3A]">
//                         <h3 className="text-lg font-semibold text-gray-200">Product Gallery</h3>
//                         <div className="grid grid-cols-3 gap-2 mt-2">
//                             {formData.images.map((image, index) => (
//                                 <div key={`existing-${index}`} className="relative">
//                                     <img src={image} alt="Product" className="h-24 w-24 object-cover rounded"/>
//                                     <button type="button" onClick={() => removeImageField(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
//                                 </div>
//                             ))}
//                             {newImageFiles.map((file, index) => (
//                                 <div key={`new-${index}`} className="relative">
//                                     <img src={URL.createObjectURL(file)} alt="Preview" className="h-24 w-24 object-cover rounded"/>
//                                     <button type="button" onClick={() => removeNewImageFile(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
//                                 </div>
//                             ))}
//                         </div>
//                          <div className="mt-4 text-center border-2 border-dashed border-[#FF9900] p-6 rounded-md">
//                             <label htmlFor="file-upload" className="cursor-pointer text-gray-400">Drag & Drop or <span className="text-yellow-400">browse</span></label>
//                             {/* 👇 Add 'multiple' to allow selecting several files */}
//                             <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleImageUpload} />
//                             <p className="text-gray-500 text-sm mt-1">jpeg, png are allowed</p>
//                         </div>
//                         <p className="text-center text-gray-500 text-sm">OR add image URLs below</p>
//                         {formData.images.map((image, index) => (
//                             <div key={index} className="flex items-center gap-2 mb-2">
//                                 <input type="text" placeholder={`Image URL ${index + 1}`} value={image} onChange={(e) => handleImageChange(index, e)} className="block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md p-2" />
//                                 <button type="button" onClick={() => removeImageField(index)} className="text-red-500 hover:text-red-400">Remove</button>
//                             </div>
//                         ))}
//                         <button type="button" onClick={addImageField} className="text-sm text-yellow-400 mt-2">+ Add Image URL</button>
//                     </div>
//                 </div>

//                 <div className="flex justify-end space-x-4 mt-6">
//                     <Link href="/admin/products" passHref><button type="button" className="bg-gray-700 text-white px-6 py-2 rounded-md font-semibold">CANCEL</button></Link>
//                     <button type="submit" disabled={loading} className="bg-[#FF9900] text-black px-6 py-2 rounded-md font-semibold">{loading ? 'Saving...' : (isUpdate ? 'UPDATE PRODUCT' : 'ADD PRODUCT')}</button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default ProductForm;

'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ProductForm = ({ onSubmit, initialProduct = null, isUpdate = false }) => {
    console.log("ProductForm received this 'initialProduct' prop:", initialProduct);
    const [formData, setFormData] = useState({
        // Corrected state keys to match backend schema
        name: '',
        description: '',
        category: 'IT girl',
        price: '',
        variants: [{ size: 'S', stock: '' }],
        images: [''],
        isNewArrival: false,
        isMostWanted: false,
        isSuggested: false,
        suggestedItems: [],
        companyId: '',
    });
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                if (!response.ok) {
                    throw new Error('Failed to fetch all products.');
                }
                const data = await response.json();
                // console.log('Fetched products for suggestions:', data.products);
                setAllProducts(data.products);
                setInitialLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setInitialLoading(false);
            }
        };
        fetchAllProducts();
    }, []);


    useEffect(() => {
        if (initialProduct) {
            // Use the functional update form to merge with the previous state
            setFormData(prevFormData => ({
                ...prevFormData, // <-- This is the key change!
                name: initialProduct.name || '',
                price: initialProduct.price ? String(initialProduct.price) : '',
                companyId: initialProduct.companyId || '',
                description: initialProduct.description || '',
                category: initialProduct.category || 'IT girl',
                variants: initialProduct.variants?.length > 0
                    ? initialProduct.variants.map(v => ({
                        size: v.size || 'S',
                        stock: v.stock?.toString() || '0',
                        sku: v.sku || '' // preserve sku
                    }))
                    : [{ size: 'S', stock: '', sku: '' }],
                images: initialProduct.images?.length > 0 ? initialProduct.images : [''],
                isNewArrival: !!initialProduct.isNewArrival,
                isMostWanted: !!initialProduct.isMostWanted,
                isSuggested: !!initialProduct.isSuggested,
                suggestedItems: initialProduct.suggestedItems?.map(i => i._id || i) || [],
            }));
        }
    }, [initialProduct]);

    // console.log("Form Data State:", formData);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleVariantChange = (index, e) => {
        const newVariants = [...formData.variants];
        newVariants[index][e.target.name] = e.target.value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };
    const addVariant = () => setFormData(prev => ({ ...prev, variants: [...prev.variants, { size: 'M', stock: '' }] }));
    const removeVariant = (index) => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

    const handleImageChange = (index, e) => {
        const newImages = [...formData.images];
        newImages[index] = e.target.value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };
    const addImageField = () => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));

    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages.length > 0 ? newImages : [''] }));
    };

    const handleSuggestedItemToggle = (productId) => {
    setFormData(prev => {
        const newSuggestedItems = prev.suggestedItems.includes(productId)
            ? prev.suggestedItems.filter(id => id !== productId) // Uncheck: Remove the ID
            : [...prev.suggestedItems, productId];              // Check: Add the ID
        return { ...prev, suggestedItems: newSuggestedItems };
    });
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSubmit = {
            companyId: formData.companyId,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: Number(formData.price),
            variants: formData.variants.map(v => ({ // <-- Modify this part
                size: v.size,
                stock: Number(v.stock),
                sku: v.sku || undefined, // Include existing SKU if it exists
            })),
            images: formData.images.filter(img => img.trim() !== ''),
            isNewArrival: !!formData.isNewArrival,
            isMostWanted: !!formData.isMostWanted,
            isSuggested: !!formData.isSuggested,
            suggestedItems: formData.suggestedItems || [],
        };

        // console.log("Submitting payload for update:", dataToSubmit); // Good for debugging
        try {
            await onSubmit(dataToSubmit);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };



    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            alert(`File "${file.name}" selected. Direct file upload requires a separate backend service for storage (like AWS S3 or Cloudinary) and is a major feature. For now, please use the URL fields.`);
        }
    };

    if (initialLoading) {
        return <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">Loading product data...</div>;
    }

    return (
        <div className="bg-[#121212] min-h-screen text-white p-6 md:p-10 font-sans">
            <header className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold">{isUpdate ? 'Edit Product' : 'Add New Product'}</h1>
                <p className="text-gray-400 text-sm">Home &gt; All Products &gt; {isUpdate ? 'Edit Product' : 'Add New Product'}</p>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4 bg-[#1C1C1C] p-6 rounded-lg border border-[#3A3A3A]">
                        <div>
                            <label htmlFor="companyId" className="block text-sm font-medium text-gray-400">Company ID</label>
                            <input type="text" id="companyId" name="companyId" value={formData.companyId} onChange={handleChange} required className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400">Product Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-400">Regular Price</label>
                                <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-400">Category</label>
                                <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md py-2 px-3 text-white focus:outline-none">
                                    <option>IT girl</option><option>Girly Pop</option><option>bloom girl</option><option>desi diva</option><option>street chic</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4">
                            <h3 className="text-lg font-semibold mb-2">Variants (Size & Stock)</h3>
                            <p className="text-sm text-gray-500 mb-2">A product is "In Stock" if any variant has a stock quantity greater than 0.</p>
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="flex items-center gap-4 mb-2 p-2 bg-[#2C2C2C] rounded">
                                    <select name="size" value={variant.size} onChange={(e) => handleVariantChange(index, e)} className="w-full bg-[#3A3A3A] border-2 border-[#5A5A5A] rounded-md p-2">
                                        <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option>
                                    </select>
                                    <input type="number" name="stock" placeholder="Stock Quantity" value={variant.stock} onChange={(e) => handleVariantChange(index, e)} required className="w-full bg-[#3A3A3A] border-2 border-[#5A5A5A] rounded-md p-2" />
                                    <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-400">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={addVariant} className="text-sm text-yellow-400 hover:text-yellow-300 mt-2">+ Add Size</button>
                        </div>

                        {/* Product Flags Section */}
                        <div className="pt-4">
                            <h3 className="text-lg font-semibold mb-2">Product Flags</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isNewArrival" name="isNewArrival" checked={formData.isNewArrival} onChange={(e) => setFormData(prev => ({ ...prev, isNewArrival: e.target.checked }))} className="form-checkbox h-5 w-5 text-yellow-400 bg-gray-700 border-gray-600 rounded" />
                                    <label htmlFor="isNewArrival" className="text-white">Mark as New Arrival</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isSuggested" name="isSuggested" checked={formData.isSuggested} onChange={(e) => setFormData(prev => ({ ...prev, isSuggested: e.target.checked }))} className="form-checkbox h-5 w-5 text-yellow-400 bg-gray-700 border-gray-600 rounded" />
                                    <label htmlFor="isSuggested" className="text-white">Mark as a Suggestion</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isMostWanted" name="isMostWanted" checked={formData.isMostWanted} onChange={(e) => setFormData(prev => ({ ...prev, isMostWanted: e.target.checked }))} className="form-checkbox h-5 w-5 text-yellow-400 bg-gray-700 border-gray-600 rounded" />
                                    <label htmlFor="isMostWanted">Mark as Most Wanted</label>
                                </div>
                            </div>
                            {/* Suggested Items Checkbox List */}
                            <div className="mt-1 max-h-60 w-full overflow-y-auto rounded-md border-2 border-[#3A3A3A] bg-[#2C2C2C] p-2">
                                <div className="space-y-2">
                                    {allProducts.map(product => (
                                        // Using a label makes the entire row clickable
                                        <label
                                            key={product._id}
                                            className="flex cursor-pointer items-center rounded-md p-2 transition-colors hover:bg-[#3A3A3A]"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.suggestedItems.includes(product._id)}
                                                onChange={() => handleSuggestedItemToggle(product._id)}
                                                className="form-checkbox mr-3 h-5 w-5 rounded border-gray-600 bg-gray-700 text-yellow-400 focus:ring-yellow-500"
                                            />
                                            <span className="text-white">{product.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-4 bg-[#1C1C1C] p-6 rounded-lg border border-[#3A3A3A]">
                        <h3 className="text-lg font-semibold text-gray-200">Product Gallery</h3>
                        <div className="mt-2 text-center border-2 border-dashed border-[#FF9900] p-6 rounded-md">
                            <label htmlFor="file-upload" className="cursor-pointer text-gray-400">Drag & Drop or <span className="text-yellow-400">browse</span></label>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} />
                            <p className="text-gray-500 text-sm">jpeg, png are allowed</p>
                        </div>
                        <p className="text-center text-gray-500 text-sm">OR add image URLs below</p>
                        {formData.images.map((image, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input type="text" placeholder={`Image URL ${index + 1}`} value={image} onChange={(e) => handleImageChange(index, e)} className="block w-full bg-[#2C2C2C] border-2 border-[#3A3A3A] rounded-md p-2" />
                                <button type="button" onClick={() => removeImageField(index)} className="text-red-500 hover:text-red-400">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={addImageField} className="text-sm text-yellow-400 mt-2">+ Add Image URL</button>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <Link href="/admin/products" passHref><button type="button" className="bg-gray-700 text-white px-6 py-2 rounded-md font-semibold">CANCEL</button></Link>
                    <button type="submit" disabled={loading} className="bg-[#FF9900] text-black px-6 py-2 rounded-md font-semibold">{loading ? 'Saving...' : (isUpdate ? 'UPDATE PRODUCT' : 'ADD PRODUCT')}</button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;