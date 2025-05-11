"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { id: "all", label: "All Categories" },
    { id: "electronics", label: "Electronics" },
    { id: "furniture", label: "Furniture" },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "transition-all",
            selectedCategory === category.id ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted/50",
          )}
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}
