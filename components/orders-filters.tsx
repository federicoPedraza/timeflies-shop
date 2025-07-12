"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Calendar, User, Mail, Filter, X } from "lucide-react";

export interface OrderFilters {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  sortBy: "created_at" | "contact_name" | "total" | "provider_order_id";
  sortOrder: "asc" | "desc";
}

interface OrdersFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  totalOrders: number;
  filteredOrders: number;
}

export function OrdersFilters({
  filters,
  onFiltersChange,
  totalOrders,
  filteredOrders
}: OrdersFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.dateFrom || filters.dateTo || filters.status;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {filteredOrders} de {totalOrders} órdenes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Ocultar" : "Mostrar"} filtros
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Búsqueda general */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o ID de orden..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros específicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por nombre */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nombre del cliente"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Email del cliente"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por estado */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Todos los estados</option>
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="unpaid">No pagado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Fecha desde"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Fecha hasta"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Ordenamiento */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-") as [OrderFilters["sortBy"], OrderFilters["sortOrder"]];
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="created_at-desc">Fecha (más reciente)</option>
              <option value="created_at-asc">Fecha (más antigua)</option>
              <option value="contact_name-asc">Nombre (A-Z)</option>
              <option value="contact_name-desc">Nombre (Z-A)</option>
              <option value="total-desc">Total (mayor)</option>
              <option value="total-asc">Total (menor)</option>
              <option value="provider_order_id-desc">ID (mayor)</option>
              <option value="provider_order_id-asc">ID (menor)</option>
            </select>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
