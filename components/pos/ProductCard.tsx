"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/pos.types";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
    onView: (product: Product) => void;
    priority?: boolean; // For above-the-fold images
}

export const ProductCard = ({ product, onAdd, onView, priority = false }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleCardClick = () => {
        onView(product);
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAdd(product);
    };

    const getCategoryIcon = (category: string | { name?: string; slug?: string } | undefined) => {
        const categoryName = typeof category === 'string'
            ? category.toLowerCase()
            : (category?.slug || category?.name || '').toLowerCase();

        const icons: Record<string, string> = {
            'mains': '🍽️',
            'appetizers': '🥗',
            'drinks': '🥤',
            'desserts': '🍰',
            'food': '🍴',
            'wine': '🍷',
            'beer': '🍺',
        };
        return icons[categoryName] || '🍽️';
    };

    return (
        <div
            className="group relative bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover-lift cursor-pointer animate-fade-in"
            onClick={handleCardClick}
        >
            {/* Quick Add Button - Desktop only, properly positioned */}
            <button
                onClick={handleQuickAdd}
                className="product-card-quick-add"
                aria-label="Quick add to cart"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>

            {/* Image Container */}
            <div className="product-card-image">
                {product.imageUrl && !imageError ? (
                    <>
                        {imageLoading && (
                            <div className="product-card-fallback product-card-shimmer">
                                <span className="product-card-fallback-icon">
                                    {getCategoryIcon(product.category)}
                                </span>
                            </div>
                        )}
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            priority={priority}
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            onLoad={() => setImageLoading(false)}
                            onError={() => {
                                setImageError(true);
                                setImageLoading(false);
                            }}
                            style={{ display: imageLoading ? 'none' : 'block' }}
                        />
                    </>
                ) : (
                    <div className="product-card-fallback">
                        <span className="product-card-fallback-icon">
                            {getCategoryIcon(product.category)}
                        </span>
                    </div>
                )}

                {/* Popular Badge */}
                {product.popularity > 50 && (
                    <div className="product-card-badge">
                        POPULAR
                    </div>
                )}
            </div>

            {/* Content - Mobile optimized text */}
            <div className="p-3 md:p-4 space-y-2">
                <h3 className="font-bold text-white text-sm md:text-base line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                    {product.name}
                </h3>
                <p className="text-xs md:text-sm text-neutral-400 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                    {product.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                    <span className="text-lg md:text-xl font-bold text-emerald-400">
                        {formatCurrency(product.price)}
                    </span>
                    {!product.isAvailable && (
                        <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded-full border border-rose-500/20">
                            Unavailable
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
