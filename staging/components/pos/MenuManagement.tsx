"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  Leaf,
  Wheat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MenuItem, MenuCategory } from "@/types/pos.types";
import { getMenuItems, toggleMenuItemAvailability } from "@/lib/actions/menu.actions";

interface MenuManagementProps {
  userRole: string;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({ userRole }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [menuItems, selectedCategory, searchQuery, showUnavailable]);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...menuItems];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        )
      );
    }

    // Availability filter
    if (!showUnavailable) {
      filtered = filtered.filter(item => item.isAvailable);
    }

    setFilteredItems(filtered);
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await toggleMenuItemAvailability(itemId, !currentStatus);
      
      // Update local state
      setMenuItems(prev => 
        prev.map(item => 
          item.$id === itemId 
            ? { ...item, isAvailable: !currentStatus }
            : item
        )
      );
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getCategoryColor = (category: MenuCategory) => {
    const colors = {
      [MenuCategory.APPETIZERS]: "bg-orange-500/20 text-orange-400",
      [MenuCategory.SOUPS]: "bg-yellow-500/20 text-yellow-400", 
      [MenuCategory.SALADS]: "bg-green-500/20 text-green-400",
      [MenuCategory.MAIN_COURSE]: "bg-red-500/20 text-red-400",
      [MenuCategory.SEAFOOD]: "bg-blue-500/20 text-blue-400",
      [MenuCategory.GRILLED]: "bg-amber-500/20 text-amber-400",
      [MenuCategory.PASTA]: "bg-purple-500/20 text-purple-400",
      [MenuCategory.DESSERTS]: "bg-pink-500/20 text-pink-400",
      [MenuCategory.BEVERAGES]: "bg-cyan-500/20 text-cyan-400",
      [MenuCategory.COCKTAILS]: "bg-violet-500/20 text-violet-400",
      [MenuCategory.WINE]: "bg-rose-500/20 text-rose-400",
      [MenuCategory.BEER]: "bg-yellow-600/20 text-yellow-300",
      [MenuCategory.COFFEE]: "bg-amber-600/20 text-amber-300"
    };
    return colors[category] || "bg-slate-500/20 text-slate-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu Management</h2>
          <p className="text-slate-400">Manage restaurant menu items and pricing</p>
        </div>
        
        {(userRole === "admin" || userRole === "manager") && (
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu items, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as MenuCategory | "all")}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {Object.values(MenuCategory).map(category => (
              <option key={category} value={category}>
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Show Unavailable Toggle */}
          <div className="flex items-center gap-2">
            <Switch 
              checked={showUnavailable}
              onCheckedChange={setShowUnavailable}
              id="show-unavailable"
            />
            <label htmlFor="show-unavailable" className="text-sm text-slate-300">
              Show unavailable items
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{menuItems.length}</p>
            <p className="text-xs text-slate-400">Total Items</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {menuItems.filter(item => item.isAvailable).length}
            </p>
            <p className="text-xs text-slate-400">Available</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {menuItems.filter(item => !item.isAvailable).length}
            </p>
            <p className="text-xs text-slate-400">Unavailable</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{filteredItems.length}</p>
            <p className="text-xs text-slate-400">Filtered Results</p>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-amber-500/50 transition-colors ${
                !item.isAvailable ? 'opacity-60' : ''
              }`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-1">{item.name}</h3>
                  <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                    {item.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {!item.isAvailable && (
                    <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                      Unavailable
                    </Badge>
                  )}
                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => handleToggleAvailability(item.$id, item.isAvailable)}
                    size="sm"
                  />
                </div>
              </div>

              {/* Item Details */}
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>

              {/* Price and Time */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold">{formatPrice(item.price)}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-sm">
                  <Clock className="w-3 h-3" />
                  <span>{item.preparationTime} min</span>
                </div>
              </div>

              {/* Dietary Info */}
              <div className="flex items-center gap-2 mb-4">
                {item.isVegetarian && (
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                    <Leaf className="w-3 h-3 mr-1" />
                    Vegetarian
                  </Badge>
                )}
                {item.isVegan && (
                  <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-300">
                    Vegan
                  </Badge>
                )}
                {item.isGlutenFree && (
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                    <Wheat className="w-3 h-3 mr-1" />
                    Gluten Free
                  </Badge>
                )}
              </div>

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-orange-400 font-medium">Allergens:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.allergens.map((allergen) => (
                      <Badge 
                        key={allergen} 
                        variant="outline"
                        className="text-xs border-orange-500/30 text-orange-300"
                      >
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-slate-400 hover:text-white"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                {(userRole === "admin" || userRole === "manager") && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
          <p className="text-slate-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border border-amber-500/20">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-amber-500 text-xl">
                  {selectedItem.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-slate-300">{selectedItem.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Pricing & Time</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Base Price:</span>
                        <span className="text-white">{formatPrice(selectedItem.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Prep Time:</span>
                        <span className="text-white">{selectedItem.preparationTime} minutes</span>
                      </div>
                      {selectedItem.calories && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Calories:</span>
                          <span className="text-white">{selectedItem.calories}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.ingredients.map((ingredient) => (
                        <Badge 
                          key={ingredient}
                          variant="secondary"
                          className="text-xs bg-slate-700 text-slate-300"
                        >
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedItem.variants && selectedItem.variants.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Variants</h4>
                    <div className="space-y-2">
                      {selectedItem.variants.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">{variant.name}</span>
                          <span className="text-amber-400">
                            {variant.priceModifier > 0 ? '+' : ''}{formatPrice(variant.priceModifier)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.customizations && selectedItem.customizations.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Customizations</h4>
                    <div className="space-y-3">
                      {selectedItem.customizations.map((customization, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300 font-medium">{customization.name}</span>
                            {customization.isRequired && (
                              <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">
                                Required
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            {customization.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex justify-between text-sm">
                                <span className="text-slate-400">{option.name}</span>
                                <span className="text-amber-400">
                                  {option.price > 0 ? `+${formatPrice(option.price)}` : 'Free'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};